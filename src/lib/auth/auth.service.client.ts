"use client";

import { SupabaseResponse } from "@/config/types/supabase-response.type";
import { UserRole } from "@/config/types/user";
import { supabase } from "@/lib/supabase"; // tu cliente browser actual

export type SignUpUserInput = {
  email: string;
  password: string;
  role?: UserRole;
};

export type Profile = {
  id: string;
  role: "user" | "merchant" | "influencer" | "admin";
  state: "pending" | "approved" | "rejected" | "blocked";
};
/**
 * OJO:
 * - Esto usa supabase browser + session del navegador
 * - NO debe importar createSupabaseServerClient ni next/headers
 */

export async function ensureProfile(role: UserRole = UserRole.USER): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("No hay sesión activa.");

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      email: data.user.email,
      role,
    },
    { onConflict: "id" }
  );

  if (upsertError) throw upsertError;

  return data.user.id;
}

export async function signUpUser({
  email,
  password,
  role = UserRole.USER,
}: SignUpUserInput): Promise<SupabaseResponse<true>> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      status: "error",
      data: null,
      error: error.message,
      code: error.code,
      message: "No se pudo crear la cuenta.",
    };
  }

  // ✅ si NO hay sesión, NO intentes ensureProfile aún
  if (!data.session) {
    return {
      status: "success",
      data: true,
      error: null,
      message: "Cuenta creada. Revisa tu correo para confirmar y comenzar a usar Promii.",
    };
  }

  // Si hay sesión (confirm OFF), ahora sí:
  try {
    await ensureProfile(role);
  } catch (err: any) {
    return {
      status: "error",
      data: null,
      error: err?.message ?? "Error creando perfil",
      message: "La cuenta fue creada, pero ocurrió un problema al crear el perfil.",
    };
  }

  return {
    status: "success",
    data: true,
    error: null,
    message: "Cuenta creada con éxito.",
  };
}


export async function logoutUser(): Promise<SupabaseResponse<true>> {
  try {
    const res = await fetch("/auth/logout", { method: "POST" });

    if (!res.ok) {
      return {
        status: "error",
        data: null,
        error: "No se pudo cerrar sesión.",
        message: "No se pudo cerrar sesión.",
      };
    }

    return {
      status: "success",
      data: true,
      error: null,
      message: "Sesión cerrada con éxito.",
    };
  } catch (e: any) {
    return {
      status: "error",
      data: null,
      error: e?.message ?? "Error desconocido",
      message: "No se pudo cerrar sesión.",
    };
  }
}

