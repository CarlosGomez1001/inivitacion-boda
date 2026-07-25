import { MapPin, Navigation, Clock, CalendarPlus } from "lucide-react";
import { googleMapsUrl, wazeUrl, googleCalendarUrl, downloadIcs } from "../utils/eventLinks";

export default function EventCard({ titulo, hora, lugar, start, end, descripcion }) {
  const calendarEvent = {
    title: `${titulo} — Andrea & Axel`,
    description: descripcion,
    location: lugar,
    start,
    end,
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-terracotta/15 bg-white/70 p-8 text-center shadow-sm">
      <h3 className="font-serif text-2xl text-terracotta">{titulo}</h3>

      <div className="flex items-center justify-center gap-2 text-sm text-charcoal/80">
        <Clock size={16} className="shrink-0 text-gold" />
        <span>{hora}</span>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-charcoal/80">
        <MapPin size={16} className="shrink-0 text-gold" />
        <span>{lugar}</span>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <a
          href={googleMapsUrl(lugar)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-terracotta px-4 py-2 text-xs tracking-wide text-terracotta uppercase transition-colors hover:bg-terracotta hover:text-white"
        >
          <MapPin size={14} /> Ver en Maps
        </a>
        <a
          href={wazeUrl(lugar)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-terracotta px-4 py-2 text-xs tracking-wide text-terracotta uppercase transition-colors hover:bg-terracotta hover:text-white"
        >
          <Navigation size={14} /> Llegar con Waze
        </a>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={googleCalendarUrl(calendarEvent)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-sage px-4 py-2 text-xs tracking-wide text-white uppercase transition-opacity hover:opacity-90"
        >
          <CalendarPlus size={14} /> Google Calendar
        </a>
        <button
          onClick={() => downloadIcs(calendarEvent)}
          className="inline-flex items-center gap-2 rounded-full bg-sage px-4 py-2 text-xs tracking-wide text-white uppercase transition-opacity hover:opacity-90"
        >
          <CalendarPlus size={14} /> iOS / Outlook (.ics)
        </button>
      </div>
    </div>
  );
}
