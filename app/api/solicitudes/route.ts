import { NextResponse } from "next/server";

// La API usa el token del usuario: Firestore aplica las mismas reglas que en la web y la móvil
const BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;

type Valor = Record<string, unknown>;
type Campos = Record<string, Valor>;

function leer(v: Valor): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) {
    const lista = (v.arrayValue as { values?: Valor[] }).values ?? [];
    return lista.map(leer);
  }
  if ("mapValue" in v)
    return aObjeto((v.mapValue as { fields?: Campos }).fields ?? {});
  return null;
}

function aObjeto(campos: Campos): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(campos).map(([k, v]) => [k, leer(v)]),
  );
}

function escribir(v: unknown): Valor {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "number") return { integerValue: String(v) };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(escribir) } };
  return { stringValue: String(v) };
}

function obtenerToken(request: Request) {
  const encabezado = request.headers.get("authorization") ?? "";
  return encabezado.startsWith("Bearer ") ? encabezado.slice(7) : null;
}

const error = (mensaje: string, status: number) =>
  NextResponse.json({ success: false, error: mensaje }, { status });

async function listar(coleccion: string, token: string) {
  const respuesta = await fetch(`${BASE}/${coleccion}?pageSize=300`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!respuesta.ok) return { status: respuesta.status, docs: [] };
  const json = (await respuesta.json()) as {
    documents?: { name: string; fields?: Campos }[];
  };
  const docs = (json.documents ?? []).map((d) => ({
    id: d.name.split("/").pop() as string,
    ...aObjeto(d.fields ?? {}),
  }));
  return { status: 200, docs };
}

export async function GET(request: Request) {
  const token = obtenerToken(request);
  if (!token) return error("Debes iniciar sesión.", 401);

  try {
    const [permisos, vacaciones] = await Promise.all([
      listar("permisos", token),
      listar("vacaciones", token),
    ]);
    const fallo = [permisos.status, vacaciones.status].find((s) => s !== 200);
    if (fallo === 401) return error("La sesión no es válida o expiró.", 401);
    if (fallo === 403)
      return error("Tu rol no puede consultar estas solicitudes.", 403);
    if (fallo) return error("No se pudieron obtener las solicitudes.", 500);

    const data = [...permisos.docs, ...vacaciones.docs].map(
      (s: Record<string, unknown>) => ({
        id: s.id,
        empleado: s.empleadoNombre,
        tipo: s.tipo,
        fechaHorario:
          s.tipo === "Vacaciones"
            ? `${s.fechaInicio} - ${s.fechaFin}`
            : s.fecha,
        empresa: s.empresa,
        estado: s.estado,
        etapaActual: s.etapaActual,
      }),
    );

    return NextResponse.json(
      { success: true, total: data.length, data },
      { status: 200 },
    );
  } catch (e) {
    console.error("Error al obtener solicitudes:", e);
    return error("No se pudieron obtener las solicitudes.", 500);
  }
}

// Crea un permiso a nombre del usuario del token
export async function POST(request: Request) {
  const token = obtenerToken(request);
  if (!token) return error("Debes iniciar sesión.", 401);

  try {
    const { fecha, motivo, empresa } = await request.json().catch(() => ({}));
    if (!fecha || !motivo?.trim())
      return error("Faltan datos obligatorios de la solicitud.", 400);
    if (new Date(`${fecha}T12:00:00`).getDay() === 0)
      return error("El domingo no se trabaja.", 400);
    if (
      fecha <
      new Date().toLocaleDateString("en-CA", {
        timeZone: "America/El_Salvador",
      })
    )
      return error("No puedes pedir permiso para un día que ya pasó.", 400);

    const uid = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    ).user_id;
    const perfil = await fetch(`${BASE}/usuarios/${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!perfil.ok) return error("La sesión no es válida o expiró.", 401);
    const u = aObjeto(
      ((await perfil.json()) as { fields?: Campos }).fields ?? {},
    );

    const nuevo = {
      empleadoUid: uid,
      empleadoNombre: `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim(),
      jefeUid: u.jefeId ?? null,
      departamento: u.departamento ?? "",
      empresa: empresa || u.empresa || "",
      tipo: "Permiso Personal",
      motivo: motivo.trim(),
      fecha,
      estado: "Pendiente",
      etapaActual: u.jefeId ? "JEFE" : "ANALISTA",
      motivoRechazo: null,
      creadaEn: new Date().toISOString(),
      historial: [],
    };
    const respuesta = await fetch(`${BASE}/permisos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: Object.fromEntries(
          Object.entries(nuevo).map(([k, v]) => [k, escribir(v)]),
        ),
      }),
    });
    if (respuesta.status === 403)
      return error("No tienes permiso para crear esta solicitud.", 403);
    if (!respuesta.ok) return error("No se pudo guardar la solicitud.", 500);
    const creado = (await respuesta.json()) as { name: string };

    return NextResponse.json(
      {
        success: true,
        mensaje: "Solicitud recibida correctamente.",
        data: { id: creado.name.split("/").pop(), ...nuevo },
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("Error al procesar solicitud:", e);
    return error("No se pudo procesar la solicitud.", 500);
  }
}
