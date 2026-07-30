import { useEffect, useState } from "react";
import { api } from "./apiClient";

const APP_URL = import.meta.env.VITE_APP_URL ?? window.location.origin;

export default function AdminInvitados() {
  const [invitados, setInvitados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [borrador, setBorrador] = useState({});

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await api.getInvitados({ search: busqueda, estado: estadoFiltro });
      setInvitados(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iniciarEdicion(inv) {
    setEditandoId(inv.id);
    setBorrador({
      pasesDeclarados: inv.pasesDeclarados ?? 0,
      telefono: inv.telefono ?? "",
      notasInternas: inv.notasInternas ?? "",
    });
  }

  async function guardarEdicion(id) {
    try {
      await api.actualizarInvitado(id, borrador);
      setEditandoId(null);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  }

  async function eliminar(id) {
    if (!window.confirm("¿Eliminar este invitado y a todos sus acompañantes?")) return;
    try {
      await api.eliminarInvitado(id);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  }

  function copiarLink(tokenAcceso) {
    const link = `${APP_URL}/invitacion/${tokenAcceso}`;
    navigator.clipboard?.writeText(link);
    alert(`Link copiado:\n${link}`);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cargar()}
          className="rounded-lg border border-terracotta/25 px-3 py-2 text-sm"
        />
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="rounded-lg border border-terracotta/25 px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="confirmado">Confirmados</option>
          <option value="pendiente">Pendientes</option>
          <option value="declinado">Declinados</option>
        </select>
        <button
          onClick={cargar}
          className="rounded-lg bg-terracotta px-4 py-2 text-xs uppercase text-white"
        >
          Filtrar
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-terracotta">{error}</p>}

      {cargando ? (
        <p className="text-sm text-charcoal/60">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-terracotta/15 text-xs uppercase tracking-widest text-charcoal/60">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Grupo</th>
                <th className="p-3">Pases</th>
                <th className="p-3">Asistencia</th>
                <th className="p-3">Acompañantes</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitados.map((inv) => (
                <tr key={inv.id} className="border-b border-terracotta/10 align-top">
                  <td className="p-3">{inv.nombre}</td>
                  <td className="p-3">{inv.grupo ?? "—"}</td>
                  <td className="p-3">
                    {editandoId === inv.id ? (
                      <input
                        type="number"
                        min="0"
                        value={borrador.pasesDeclarados}
                        onChange={(e) =>
                          setBorrador((b) => ({ ...b, pasesDeclarados: Number(e.target.value) }))
                        }
                        className="w-16 rounded border border-terracotta/25 px-2 py-1"
                      />
                    ) : (
                      (inv.pasesDeclarados ?? "—")
                    )}
                  </td>
                  <td className="p-3">
                    {inv.asistencia === "si"
                      ? "Confirmado"
                      : inv.asistencia === "no"
                        ? "Declinó"
                        : "Pendiente"}
                  </td>
                  <td className="p-3">
                    {inv.acompanantes?.length ? (
                      <ul className="space-y-0.5">
                        {inv.acompanantes.map((a) => (
                          <li key={a.id}>
                            {a.nombre} —{" "}
                            {a.asistencia === "si"
                              ? "Sí"
                              : a.asistencia === "no"
                                ? "No"
                                : "Pendiente"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => copiarLink(inv.tokenAcceso)}
                        className="text-left text-xs text-terracotta underline"
                      >
                        Copiar link
                      </button>
                      {editandoId === inv.id ? (
                        <button
                          onClick={() => guardarEdicion(inv.id)}
                          className="text-left text-xs text-sage underline"
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          onClick={() => iniciarEdicion(inv)}
                          className="text-left text-xs text-charcoal/60 underline"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => eliminar(inv.id)}
                        className="text-left text-xs text-terracotta/70 underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invitados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-charcoal/50">
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
