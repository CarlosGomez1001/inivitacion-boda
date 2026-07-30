import { useState } from "react";
import { api } from "./apiClient";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const admin = await api.login(email, password);
      onLogin(admin);
    } catch (err) {
      setError(err.message ?? "Credenciales inválidas");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush px-6 font-sans text-charcoal">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-charcoal">Panel de novios</h1>
        <p className="mt-1 text-xs text-charcoal/60">Inicia sesión para administrar tu boda.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs tracking-widest text-charcoal/60 uppercase">Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-terracotta/25 px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </div>
          <div>
            <label className="text-xs tracking-widest text-charcoal/60 uppercase">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-terracotta/25 px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </div>

          {error && <p className="text-xs text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 rounded-full bg-terracotta px-6 py-3 text-xs tracking-wide text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {cargando ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
