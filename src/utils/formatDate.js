const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatFechaLarga(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

export function formatFechaCorta(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return `${String(d).padStart(2, "0")} · ${MESES[m - 1].slice(0, 3).toUpperCase()} · ${y}`;
}
