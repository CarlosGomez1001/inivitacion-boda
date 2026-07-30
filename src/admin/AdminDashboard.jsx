import { useEffect, useState } from "react";
import { api } from "./apiClient";
import AdminInvitados from "./AdminInvitados";

export default function AdminDashboard({ admin, onLogout }) {
  const [vista, setVista] = useState("resumen"); // resumen | invitados
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getEstadisticas()
      .then(setEstadisticas)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-blush font-sans text-charcoal">
      <header className="flex items-center justify-between border-b border-terracotta/15 bg-white px-6 py-4">
        <div>
          <p className="font-serif text-lg">Panel de novios</p>
          <p className="text-xs text-charcoal/60">{admin.email}</p>
        </div>
        <nav className="flex items-center gap-4 text-xs tracking-widest uppercase">
          <button
            onClick={() => setVista("resumen")}
            className={vista === "resumen" ? "text-terracotta" : "text-charcoal/60"}
          >
            Resumen
          </button>
          <button
            onClick={() => setVista("invitados")}
            className={vista === "invitados" ? "text-terracotta" : "text-charcoal/60"}
          >
            Invitados
          </button>
          <button onClick={onLogout} className="text-charcoal/60">
            Salir
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {vista === "resumen" && (
          <>
            {error && <p className="text-sm text-terracotta">{error}</p>}
            {estadisticas && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Tarjeta label="Total personas" valor={estadisticas.totalPersonas} />
                <Tarjeta label="Grupos invitados" valor={estadisticas.totalGruposInvitados} />
                <Tarjeta label="Confirmados" valor={estadisticas.confirmados} />
                <Tarjeta label="Pendientes" valor={estadisticas.pendientes} />
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => api.descargarReporte("excel").catch((err) => alert(err.message))}
                className="rounded-full border border-terracotta px-5 py-2 text-xs tracking-widest text-terracotta uppercase"
              >
                Descargar Excel
              </button>
              <button
                onClick={() => api.descargarReporte("pdf").catch((err) => alert(err.message))}
                className="rounded-full border border-terracotta px-5 py-2 text-xs tracking-widest text-terracotta uppercase"
              >
                Descargar PDF
              </button>
            </div>
          </>
        )}

        {vista === "invitados" && <AdminInvitados />}
      </main>
    </div>
  );
}

function Tarjeta({ label, valor }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
      <p className="font-serif text-3xl text-terracotta">{valor}</p>
      <p className="mt-1 text-xs tracking-widest text-charcoal/60 uppercase">{label}</p>
    </div>
  );
}
