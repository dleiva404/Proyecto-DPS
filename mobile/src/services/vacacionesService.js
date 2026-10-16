const DIAS_ANUALES = 15;

const FERIADOS_FIJOS = {
  "01-01": "Año Nuevo",
  "05-01": "Día del Trabajo",
  "05-10": "Día de la Madre",
  "06-17": "Día del Padre",
  "08-06": "Fiestas Agostinas",
  "09-15": "Día de la Independencia",
  "11-02": "Día de los Difuntos",
  "12-25": "Navidad",
};

function aTexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function domingoDePascua(anio) {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia, 12);
}

export function nombreFeriado(fechaTexto) {
  if (!fechaTexto) return null;
  const fijo = FERIADOS_FIJOS[fechaTexto.slice(5, 10)];
  if (fijo) return fijo;

  const pascua = domingoDePascua(Number(fechaTexto.slice(0, 4)));
  const santos = [
    [-3, "Jueves Santo"],
    [-2, "Viernes Santo"],
    [-1, "Sábado Santo"],
  ];
  for (const [dias, nombre] of santos) {
    const fecha = new Date(pascua);
    fecha.setDate(pascua.getDate() + dias);
    if (aTexto(fecha) === fechaTexto) return nombre;
  }
  return null;
}

function crearFechaAniversario(fechaIngreso, anio) {
  const [, month, day] = fechaIngreso.split("-").map(Number);
  const ultimoDia = new Date(anio, month, 0).getDate();

  return new Date(anio, month - 1, Math.min(day, ultimoDia), 12);
}

export function contarDiasHabiles(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) return 0;

  const inicio = new Date(`${fechaInicio}T12:00:00`);
  const fin = new Date(`${fechaFin}T12:00:00`);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return 0;
  }

  let dias = 0;

  for (
    const fecha = new Date(inicio);
    fecha <= fin;
    fecha.setDate(fecha.getDate() + 1)
  ) {
    const dia = fecha.getDay();
    if (dia !== 0 && !nombreFeriado(aTexto(fecha))) dias++;
  }

  return dias;
}

export function obtenerPeriodoVacacional(
  fechaIngreso,
  fechaReferencia = new Date(),
) {
  if (!fechaIngreso) return null;

  const ingreso = new Date(`${fechaIngreso}T12:00:00`);
  if (Number.isNaN(ingreso.getTime()) || ingreso > fechaReferencia) {
    return null;
  }

  let inicio = crearFechaAniversario(
    fechaIngreso,
    fechaReferencia.getFullYear(),
  );

  if (inicio > fechaReferencia) {
    inicio = crearFechaAniversario(
      fechaIngreso,
      fechaReferencia.getFullYear() - 1,
    );
  }

  const fin = crearFechaAniversario(fechaIngreso, inicio.getFullYear() + 1);

  return {
    inicio: inicio.toISOString().slice(0, 10),
    fin: fin.toISOString().slice(0, 10),
  };
}

export function obtenerSaldo(fechaIngreso, diasTomados = 0, hoy = new Date()) {
  if (!obtenerPeriodoVacacional(fechaIngreso, hoy)) return 0;

  return Math.max(0, DIAS_ANUALES - Math.max(0, Number(diasTomados) || 0));
}

export function validarSolicitudVacaciones({
  fechaInicio,
  fechaFin,
  motivo,
  saldoDisponible,
  fechaIngreso,
}) {
  const errores = {};
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoFecha.test(fechaInicio || "")) {
    errores.fechaInicio = "Ingresa la fecha inicial (AAAA-MM-DD).";
  }

  if (!formatoFecha.test(fechaFin || "")) {
    errores.fechaFin = "Ingresa la fecha final (AAAA-MM-DD).";
  }

  if (!errores.fechaInicio && !errores.fechaFin) {
    const inicio = new Date(`${fechaInicio}T12:00:00`);
    const fin = new Date(`${fechaFin}T12:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fin.getTime()) ||
      inicio.toISOString().slice(0, 10) !== fechaInicio ||
      fin.toISOString().slice(0, 10) !== fechaFin
    ) {
      errores.fechas = "Las fechas no son válidas.";
    } else if (fechaInicio > fechaFin) {
      errores.fechas =
        "La fecha final debe ser igual o posterior a la inicial.";
    } else if (inicio < hoy) {
      errores.fechaInicio = "No puedes solicitar vacaciones en el pasado.";
    } else if (inicio.getDay() === 0 || fin.getDay() === 0) {
      errores.fechas =
        "Las vacaciones no pueden iniciar ni terminar en domingo.";
    } else if (nombreFeriado(fechaInicio) || nombreFeriado(fechaFin)) {
      errores.fechas = `Las vacaciones no pueden iniciar ni terminar en feriado (${
        nombreFeriado(fechaInicio) || nombreFeriado(fechaFin)
      }).`;
    } else {
      const periodo = obtenerPeriodoVacacional(fechaIngreso);

      if (!periodo) {
        errores.fechaIngreso = "No se pudo calcular tu período vacacional.";
      } else if (fechaInicio < periodo.inicio || fechaFin >= periodo.fin) {
        errores.fechas = `Las fechas deben estar dentro de tu período anual: ${periodo.inicio} a ${periodo.fin}.`;
      }
    }
  }

  if (!motivo?.trim()) {
    errores.motivo = "Escribe el motivo de la solicitud.";
  }

  if (!errores.fechaInicio && !errores.fechaFin && !errores.fechas) {
    const dias = contarDiasHabiles(fechaInicio, fechaFin);

    if (dias === 0) {
      errores.fechas = "Selecciona al menos un día hábil.";
    } else if (dias > saldoDisponible) {
      errores.saldo = `Solicitas ${dias} días y solo tienes ${saldoDisponible} disponibles.`;
    }
  }

  return errores;
}

export { DIAS_ANUALES };
