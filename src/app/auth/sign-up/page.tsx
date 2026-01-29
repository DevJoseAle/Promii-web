"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { UserRole } from "@/config/types/user";
import { signUpUser } from "@/lib/auth/auth.service.client";

export default function SignUpUserPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Ingresa tu email.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");

    setLoading(true);

    const res = await signUpUser({ email, password, role: UserRole.USER });

    setLoading(false);

    if (res.status === "error") {
      setError(res.message ?? res.error);
      return;
    }

    router.replace("/");
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Regístrate para comprar Promiis.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none",
            "focus:ring-2 focus:ring-primary/20"
          )}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          autoComplete="email"
        />

        <input
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none",
            "focus:ring-2 focus:ring-primary/20"
          )}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
        />

        <input
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none",
            "focus:ring-2 focus:ring-primary/20"
          )}
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white",
            "disabled:opacity-60"
          )}
        >
          {loading ? "Creando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}
