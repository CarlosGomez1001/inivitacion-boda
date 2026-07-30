import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Reveal from "./Reveal";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export default function Rsvp({ mensaje, confirmacion, token }) {
  // estado: sin-token | cargando | error | listo | enviado
  const [estado, setEstado] = useState(token ? "cargando" : "sin-token");
  const [invitado, setInvitado] = useState(null);
  const [acompanantes, setAcompanantes] = useState([]);
  const [respuestas, setRespuestas] = useState({}); // { [id]: { asiste, restricciones } }
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;

    async function cargarInvitacion() {
      try {
        const res = await fetch(`${API_URL}/api/invitacion/${token}`);
        if (!res.ok) throw new Error("no-encontrado");
        const data = await res.json();
        if (cancelado) return;

        setInvitado(data.invitado);
        setAcompanantes(data.acompanantes ?? []);

        const iniciales = {};
        [data.invitado, ...(data.acompanantes ?? [])].forEach((persona) => {
          iniciales[persona.id] = {
            asiste: persona.asistencia === "no" ? false : true,
            restricciones: persona.restriccionesAlimentarias ?? "",
          };
        });
        setRespuestas(iniciales);
        setEstado("listo");
      } catch {
        if (!cancelado) setEstado("error");
      }
    }

    cargarInvitacion();
    return () => {
      cancelado = true;
    };
  }, [token]);

  function actualizarAsiste(id, asiste) {
    setRespuestas((prev) => ({ ...prev, [id]: { ...prev[id], asiste } }));
  }

  function actualizarRestricciones(id, restricciones) {
    setRespuestas((prev) => ({ ...prev, [id]: { ...prev[id], restricciones } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setErrorEnvio(null);

    const personas = [invitado, ...acompanantes];
    const confirmaciones = personas.map((persona) => ({
      invitadoId: persona.id,
      asistencia: respuestas[persona.id]?.asiste ? "si" : "no",
      restriccionesAlimentarias: respuestas[persona.id]?.asiste
        ? respuestas[persona.id]?.restricciones || null
        : null,
    }));

    try {
      const res = await fetch(`${API_URL}/api/invitacion/${token}/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmaciones }),
      });
      if (!res.ok) throw new Error("fallo-envio");
      const data = await res.json();
      setInvitado(data.invitado);
      setAcompanantes(data.acompanantes ?? []);
      setEstado("enviado");
    } catch {
      setErrorEnvio("No pudimos guardar tu confirmación. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

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

        {estado === "sin-token" && (
          <div className="mt-10 rounded-2xl bg-blush p-8 text-sm text-charcoal/70">
            Este RSVP es personal. Usa el enlace con tu nombre que te compartieron
            los novios para poder confirmar tu asistencia.
          </div>
        )}

        {estado === "cargando" && (
          <div className="mt-10 flex flex-col items-center gap-2 text-charcoal/70">
            <Loader2 size={24} className="animate-spin" />
            <p className="text-sm">Cargando tu invitación…</p>
          </div>
        )}

        {estado === "error" && (
          <div className="mt-10 flex flex-col items-center gap-2 rounded-2xl bg-blush p-8 text-charcoal/70">
            <AlertCircle size={24} className="text-terracotta" />
            <p className="text-sm">
              No encontramos una invitación con este enlace. Verifica que sea
              exactamente el link que te compartieron los novios.
            </p>
          </div>
        )}

        {estado === "enviado" && invitado && (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-blush p-8">
            <CheckCircle2 size={28} className="text-sage" />
            <p className="font-serif text-xl text-charcoal">¡Gracias, {invitado.nombre}!</p>
            <p className="text-sm text-charcoal/70">Tu confirmación ha sido registrada.</p>
            <button
              type="button"
              onClick={() => setEstado("listo")}
              className="mt-2 text-xs tracking-widest text-terracotta uppercase underline"
            >
              Editar mi respuesta
            </button>
          </div>
        )}

        {estado === "listo" && invitado && (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 text-left">
            {[invitado, ...acompanantes].map((persona) => (
              <div
                key={persona.id}
                className="rounded-lg border border-terracotta/25 bg-blush px-4 py-3"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={respuestas[persona.id]?.asiste ?? true}
                    onChange={(e) => actualizarAsiste(persona.id, e.target.checked)}
                    className="h-5 w-5 accent-terracotta"
                  />
                  <span className="text-sm text-charcoal">
                    {persona.nombre}
                    {persona.id === invitado.id ? " (tú)" : ""}
                  </span>
                </label>

                {respuestas[persona.id]?.asiste && (
                  <input
                    type="text"
                    value={respuestas[persona.id]?.restricciones ?? ""}
                    onChange={(e) => actualizarRestricciones(persona.id, e.target.value)}
                    placeholder="Restricción alimentaria (opcional)"
                    className="mt-2 w-full rounded-lg border border-terracotta/15 bg-white px-3 py-2 text-xs text-charcoal outline-none focus:border-terracotta"
                  />
                )}
              </div>
            ))}

            {errorEnvio && <p className="text-xs text-terracotta">{errorEnvio}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 rounded-full bg-terracotta px-6 py-3 text-xs tracking-wide text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {enviando ? "Enviando…" : "Confirmar asistencia"}
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
