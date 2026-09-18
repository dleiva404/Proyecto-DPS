const DIAS_POR_ANIO = 15;
const MESES_VIGENCIA = 12;

// Cuenta los días hábiles (lunes a viernes) entre dos fechas.

export function contarDiasHabiles(
  fechaInicio: string,
  fechaFin: string,
): number {
  const inicio = new Date(fechaInicio + "T00:00:00");
  const fin = new Date(fechaFin + "T00:00:00");

  if (fin < inicio) return 0;

  let dias = 0;
  const actual = new Date(inicio);

  while (actual <= fin) {
    const diaSemana = actual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      dias++;
    }
    actual.setDate(actual.getDate() + 1);
  }

  return dias;
}

/**
 * Aniversario laboral más reciente respecto a la fecha dada.
 * @returns null si el empleado aún no cumple un año de trabajo.
 */
export function ultimoAniversario(
  fechaContratacion: string,
  hoy: Date,
): Date | null {
  const ingreso = new Date(fechaContratacion + "T00:00:00");
  const aniversario = new Date(ingreso);
  aniversario.setFullYear(hoy.getFullYear());

  if (aniversario > hoy) {
    aniversario.setFullYear(hoy.getFullYear() - 1);
  }

  // Si aún no cumple un año de trabajo, no ha ganado vacaciones
  if (aniversario < ingreso) return null;

  return aniversario;
}

/**
 * Fecha en que vencen los días de vacaciones del periodo vigente.
 * @returns null si el empleado aún no cumple un año de trabajo.
 */
export function fechaVencimiento(
  fechaContratacion: string,
  hoy: Date,
): Date | null {
  const aniversario = ultimoAniversario(fechaContratacion, hoy);
  if (!aniversario) return null;

  const vencimiento = new Date(aniversario);
  vencimiento.setMonth(vencimiento.getMonth() + MESES_VIGENCIA);
  return vencimiento;
}

/**
 * Indica si el periodo de vacaciones actual ya venció (los días se perdieron).
 */
export function estaVencido(fechaContratacion: string, hoy: Date): boolean {
  const vencimiento = fechaVencimiento(fechaContratacion, hoy);
  if (!vencimiento) return false;
  return hoy > vencimiento;
}

/**
 * Días restantes antes de que venzan las vacaciones.
 * @returns null si el empleado aún no cumple un año de trabajo.
 */
export function diasParaVencimiento(
  fechaContratacion: string,
  hoy: Date,
): number | null {
  const vencimiento = fechaVencimiento(fechaContratacion, hoy);
  if (!vencimiento) return null;

  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.ceil((vencimiento.getTime() - hoy.getTime()) / msPorDia);
}

/**
 * Días de vacaciones disponibles.
 * Reglas:
 * - Al cumplir un año de contrato se habilitan 15 días.
 * - Se tienen 12 meses para gozarlos; los no gozados se pierden.
 * @returns 0 si el empleado aún no cumple un año de contratación o si el periodo ya venció.
 */
export function calcularDiasDisponibles(
  fechaContratacion: string,
  diasTomados: number,
  hoy: Date,
): number {
  const aniversario = ultimoAniversario(fechaContratacion, hoy);
  if (!aniversario) return 0;
  if (estaVencido(fechaContratacion, hoy)) return 0;

  const diasDisponibles = DIAS_POR_ANIO - diasTomados;
  return diasDisponibles > 0 ? diasDisponibles : 0;
}
