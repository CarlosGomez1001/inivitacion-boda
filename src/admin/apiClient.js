const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "admin_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    throw new Error("no-autorizado");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Ocurrió un error inesperado");
  }

  return res;
}

export const api = {
  getToken,
  setToken,

  async login(email, password) {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Credenciales inválidas");
    }
    const data = await res.json();
    setToken(data.token);
    return data.admin;
  },

  logout() {
    setToken(null);
  },

  async me() {
    const res = await request("/api/admin/me");
    return (await res.json()).admin;
  },

  async getEstadisticas() {
    const res = await request("/api/admin/estadisticas");
    return res.json();
  },

  async getInvitados(params = {}) {
    const limpio = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    );
    const query = new URLSearchParams(limpio).toString();
    const res = await request(`/api/admin/invitados${query ? `?${query}` : ""}`);
    return (await res.json()).invitados;
  },

  async crearInvitado(datos) {
    const res = await request("/api/admin/invitados", {
      method: "POST",
      body: JSON.stringify(datos),
    });
    return (await res.json()).invitado;
  },

  async actualizarInvitado(id, cambios) {
    const res = await request(`/api/admin/invitados/${id}`, {
      method: "PUT",
      body: JSON.stringify(cambios),
    });
    return (await res.json()).invitado;
  },

  async eliminarInvitado(id) {
    await request(`/api/admin/invitados/${id}`, { method: "DELETE" });
  },

  async descargarReporte(tipo) {
    // tipo: "excel" | "pdf". Requiere blob + fetch (no <a href>) porque
    // el endpoint exige el header Authorization.
    const token = getToken();
    const res = await fetch(`${API_URL}/api/admin/reportes/${tipo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("No se pudo generar el reporte");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tipo === "excel" ? "confirmados.xlsx" : "confirmados.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
