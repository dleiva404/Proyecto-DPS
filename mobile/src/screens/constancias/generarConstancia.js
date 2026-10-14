
import { calcularAntiguedad } from "./calcularAntiguedad";

export function generarConstancia({
  tipo,
  empleado,
  fechaIngreso,
  cargo,
  departamento,
  salario,
  destinatario,
  autorizadoPor,
  fechaEmision,
  codigo,
}) {
  if (!empleado || !fechaIngreso || !autorizadoPor || !codigo) {
    throw new Error("Faltan datos obligatorios de la constancia.");
  }

  const antiguedadCalculada = calcularAntiguedad(fechaIngreso);

  if (!antiguedadCalculada) {
    throw new Error("La fecha de ingreso no es válida.");
  }

  const antiguedad = antiguedadCalculada.texto;

  const tipoNormalizado = String(tipo || "laboral")
    .trim()
    .toLowerCase();

  const esSalarial = tipoNormalizado.includes("salarial");

  if (esSalarial && (salario === null || salario === undefined || salario === "")) {
    throw new Error("La constancia salarial requiere el salario del empleado.");
  }

  const tipoConstancia = esSalarial
    ? "Constancia salarial"
    : "Constancia laboral";

  const fechaDocumento = fechaEmision || new Date().toISOString().slice(0, 10);

  const contenido = [
    "DIDELCO",
    tipoConstancia.toUpperCase(),
    "",
    `Por medio de la presente se hace constar que ${empleado} labora en DIDELCO.`,
    cargo ? `Cargo: ${cargo}.` : "",
    departamento ? `Departamento: ${departamento}.` : "",
    `Fecha de ingreso: ${fechaIngreso}.`,
    `Antigüedad laboral: ${antiguedad}.`,
    esSalarial ? `Salario: ${salario}.` : "",
    destinatario ? `Dirigida a: ${destinatario}.` : "",
    "",
    `Fecha de emisión: ${fechaDocumento}.`,
    `Autorizado por: ${autorizadoPor}.`,
    `Código de verificación: ${codigo}.`,
  ]
    .filter((linea) => linea !== "")
    .join("\n");

  return {
    tipo: tipoConstancia,
    empleado,
    cargo: cargo || null,
    departamento: departamento || null,
    fechaIngreso,
    antiguedad,
    salario: esSalarial ? salario : null,
    destinatario: destinatario || null,
    autorizadoPor,
    fechaEmision: fechaDocumento,
    codigo,
    estado: "Aprobada",
    contenido,
  };
}

