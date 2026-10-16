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
  const nombreEmpleado = String(empleado || "").trim();
  const nombreAutorizador = String(autorizadoPor || "").trim();
  const codigoVerificacion = String(codigo || "").trim();

  if (!nombreEmpleado || !fechaIngreso || !nombreAutorizador || !codigoVerificacion) {
    throw new Error("Faltan datos obligatorios de la constancia.");
  }

  const fechaDocumento = fechaEmision
    ? String(fechaEmision)
    : new Date().toISOString().slice(0, 10);

  const fechaValida = (valor) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const fecha = new Date(`${valor}T12:00:00`);
    return (
      !Number.isNaN(fecha.getTime()) &&
      fecha.getFullYear() === Number(valor.slice(0, 4)) &&
      fecha.getMonth() + 1 === Number(valor.slice(5, 7)) &&
      fecha.getDate() === Number(valor.slice(8, 10))
    );
  };

  if (!fechaValida(fechaDocumento)) {
    throw new Error("La fecha de emisión no es válida.");
  }

  const antiguedadCalculada = calcularAntiguedad(
    fechaIngreso,
    new Date(`${fechaDocumento}T12:00:00`)
  );

  if (!antiguedadCalculada || !antiguedadCalculada.texto) {
    throw new Error("La fecha de ingreso no es válida.");
  }

  const fechaIngresoDate = new Date(`${fechaIngreso}T12:00:00`);

  if (
    !fechaValida(fechaIngreso) ||
    fechaIngresoDate > new Date(`${fechaDocumento}T12:00:00`)
  ) {
    throw new Error("La fecha de ingreso no puede ser posterior a la emisión.");
  }

  const tipoNormalizado = String(tipo || "laboral")
    .trim()
    .toLowerCase();

  if (!["laboral", "salarial", "constancia laboral", "constancia salarial"].includes(tipoNormalizado)) {
    throw new Error("El tipo de constancia no es válido.");
  }

  const esSalarial = tipoNormalizado.includes("salarial");

  if (
    esSalarial &&
    (salario === null || salario === undefined || String(salario).trim() === "")
  ) {
    throw new Error("La constancia salarial requiere el salario del empleado.");
  }

  const salarioNumero = esSalarial ? Number(salario) : null;

  if (esSalarial && (!Number.isFinite(salarioNumero) || salarioNumero < 0)) {
    throw new Error("El salario debe ser un número válido.");
  }

  const tipoConstancia = esSalarial
    ? "Constancia salarial"
    : "Constancia laboral";

  const salarioTexto = esSalarial
    ? `$${salarioNumero.toFixed(2)}`
    : null;

  const contenido = [
    "DIDELCO",
    tipoConstancia.toUpperCase(),
    "",
    `Por medio de la presente se hace constar que ${nombreEmpleado} labora en DIDELCO.`,
    cargo ? `Cargo: ${cargo}.` : null,
    departamento ? `Departamento: ${departamento}.` : null,
    `Fecha de ingreso: ${fechaIngreso}.`,
    `Antigüedad laboral: ${antiguedadCalculada.texto}.`,
    esSalarial ? `Salario: ${salarioTexto}.` : null,
    destinatario ? `Dirigida a: ${destinatario}.` : null,
    "",
    `Fecha de emisión: ${fechaDocumento}.`,
    `Autorizado por: ${nombreAutorizador}.`,
    `Código de verificación: ${codigoVerificacion}.`,
  ]
    .filter((linea) => linea !== null)
    .join("\n");

  return {
    tipo: tipoConstancia,
    empleado: nombreEmpleado,
    cargo: cargo || null,
    departamento: departamento || null,
    fechaIngreso,
    antiguedad: antiguedadCalculada.texto,
    salario: salarioNumero,
    destinatario: destinatario || null,
    autorizadoPor: nombreAutorizador,
    fechaEmision: fechaDocumento,
    codigo: codigoVerificacion,
    estado: "Aprobada",
    contenido,
  };
}
