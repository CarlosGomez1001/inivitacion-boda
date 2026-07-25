import { useState } from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";

export default function Rsvp({ mensaje, confirmacion }) {
  const [nombre, setNombre] = useState("");
  const [asistencia, setAsistencia] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || asistencia === null) return;
    setEnviado(true);
  };

  return (
    <section id="rsvp" className="bg-blush-dark px-6 py-24">
      <Reveal className="mx-auto max-w-lg text-center">
        <p className="font-sans text-xs tracking-[0.3em] text-terracotta uppercase">
          Confirmación de asistencia
        </p>
        <h2 className="mt-3 font-serif text-4xl text-charcoal">RSVP</h2>
        <p className="mt-5 font-sans text-sm leading-relaxed text-charcoal/70">{mensaje}</p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blush px-4 py-2 text-xs text-charcoal/70">
          <CalendarClock size={14} className="text-gold" />
          {confirmacion}
        </div>

        {enviado ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-blush p-8">
            <CheckCircle2 size={28} className="text-sage" />
            <p className="font-serif text-xl text-charcoal">¡Gracias, {nombre}!</p>
            <p className="text-sm text-charcoal/70">
              {asistencia === "si"
                ? "Tu confirmación ha sido registrada. ¡Nos vemos en la boda!"
                : "Lamentamos que no puedas acompañarnos, gracias por avisar."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 text-left">
            <div>
              <label className="text-xs tracking-widest text-charcoal/60 uppercase">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-2 w-full rounded-lg border border-terracotta/25 bg-blush px-4 py-3 text-sm text-charcoal outline-none focus:border-terracotta"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <span className="text-xs tracking-widest text-charcoal/60 uppercase">
                ¿Asistirás?
              </span>
              <div className="mt-2 flex gap-3">
                {[
                  { value: "si", label: "Sí, ahí estaré" },
                  { value: "no", label: "No podré ir" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setAsistencia(opt.value)}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm transition-colors ${
                      asistencia === opt.value
                        ? "border-terracotta bg-terracotta text-white"
                        : "border-terracotta/25 bg-blush text-charcoal/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 rounded-full bg-terracotta px-6 py-3 text-xs tracking-wide text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!nombre || asistencia === null}
            >
              Confirmar asistencia
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
