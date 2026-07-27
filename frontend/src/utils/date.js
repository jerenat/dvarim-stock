export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-AR");
}

export function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatearFechaHora(fecha) {
  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}