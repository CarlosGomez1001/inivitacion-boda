import { useEffect, useState } from "react";
import { api } from "./apiClient";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      if (!api.getToken()) {
        setCargando(false);
        return;
      }
      try {
        const data = await api.me();
        setAdmin(data);
      } catch {
        // token inválido o expirado: apiClient ya lo limpió
      } finally {
        setCargando(false);
      }
    }
    verificarSesion();
  }, []);

  function handleLogout() {
    api.logout();
    setAdmin(null);
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blush font-sans text-charcoal">
        Cargando…
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLogin={setAdmin} />;
  }

  return <AdminDashboard admin={admin} onLogout={handleLogout} />;
}
