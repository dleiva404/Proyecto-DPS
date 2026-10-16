
const DIAS_ANUALES = 15;

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
        if (dia !== 0 && dia !== 6) dias++;
    }

    return dias;
}

export function obtenerPeriodoVacacional(fechaIngreso, fechaReferencia = new Date()) {
    if (!fechaIngreso) return null;

    const ingreso = new Date(`${fechaIngreso}T12:00:00`);
    if (Number.isNaN(ingreso.getTime()) || ingreso > fechaReferencia) {
        return null;
    }

    let inicio = crearFechaAniversario(fechaIngreso, fechaReferencia.getFullYear());

    if (inicio > fechaReferencia) {
        inicio = crearFechaAniversario(
            fechaIngreso,
            fechaReferencia.getFullYear() - 1,
        );
    }

    const fin = crearFechaAniversario(
        fechaIngreso,
        inicio.getFullYear() + 1,
    );

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
            errores.fechas = "La fecha final debe ser igual o posterior a la inicial.";
        } else if (inicio < hoy) {
            errores.fechaInicio = "No puedes solicitar vacaciones en el pasado.";
        } else {
            const periodo = obtenerPeriodoVacacional(fechaIngreso);

            if (!periodo) {
                errores.fechaIngreso = "No se pudo calcular tu período vacacional.";
            } else if (
                fechaInicio < periodo.inicio ||
                fechaFin >= periodo.fin
            ) {
                errores.fechas =
                    `Las fechas deben estar dentro de tu período anual: ${periodo.inicio} a ${periodo.fin}.`;
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
            errores.saldo =
                `Solicitas ${dias} días y solo tienes ${saldoDisponible} disponibles.`;
        }
    }

    return errores;
}

export { DIAS_ANUALES };
