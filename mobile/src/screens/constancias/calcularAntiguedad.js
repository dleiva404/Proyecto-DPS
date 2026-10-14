
export function calcularAntiguedad(fechaIngreso, fechaActual = new Date()) {
  if (!fechaIngreso) return null;

  const ingreso =
    fechaIngreso instanceof Date
      ? new Date(fechaIngreso.getTime())
      : new Date(`${fechaIngreso}T12:00:00`);

  if (
    Number.isNaN(ingreso.getTime()) ||
    Number.isNaN(fechaActual.getTime()) ||
    ingreso > fechaActual
  ) {
    return null;
  }

  let anios = fechaActual.getFullYear() - ingreso.getFullYear();
  let meses = fechaActual.getMonth() - ingreso.getMonth();

  if (fechaActual.getDate() < ingreso.getDate()) {
    meses--;
  }

  if (meses < 0) {
    anios--;
    meses += 12;
  }

  return {
    anios,
    meses,
    texto: `${anios} año${anios !== 1 ? "s" : ""} y ${meses} mes${
      meses !== 1 ? "es" : ""
    }`,
  };
}

