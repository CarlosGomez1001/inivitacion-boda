export function googleMapsUrl(lugar) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;
}

export function wazeUrl(lugar) {
  return `https://waze.com/ul?q=${encodeURIComponent(lugar)}&navigate=yes`;
}

function toIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildEventDates(fechaBoda, horaRango) {
  const [inicio, fin] = horaRango.split(" a ").map((h) => h.trim());
  const start = new Date(`${fechaBoda}T${inicio}:00`);
  const end = fin ? new Date(`${fechaBoda}T${fin}:00`) : new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

export function googleCalendarUrl({ title, description, location, start, end }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location,
    dates: `${toIcsDate(start)}/${toIcsDate(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs({ title, description, location, start, end }) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitacion Boda//ES",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@invitacion-boda`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "boda-andrea-axel.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
