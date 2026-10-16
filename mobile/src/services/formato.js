// "2026-10-20" -> "20/10/2026"
export function formatearFecha(iso) {
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

// "2026-10-12T08:30:00.000Z" -> "12/10/2026, 08:30"
export function formatearFechaHora(iso) {
  return new Date(iso).toLocaleString("es-SV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
