// ═══════════════════════════════════════════════════════════════
// PROFILE SERVICE
// ═══════════════════════════════════════════════════════════════
// Servicio para actualizar datos del perfil de usuario

import { supabase } from "../supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";
import type { UserProfileUpdate } from "@/config/types/user-dashboard";

// ─────────────────────────────────────────────────────────────
// UPDATE: Actualizar datos básicos del perfil
// ─────────────────────────────────────────────────────────────
export async function updateUserProfile(
  userId: string,
  data: UserProfileUpdate
): Promise<SupabaseResponse<void>> {
  try {
    // Validaciones básicas
    if (!data.first_name || data.first_name.trim().length < 2) {
      return {
        status: "error",
        data: null,
        error: "El nombre debe tener al menos 2 caracteres",
        code: "VALIDATION_ERROR",
      };
    }

    if (!data.last_name || data.last_name.trim().length < 2) {
      return {
        status: "error",
        data: null,
        error: "El apellido debe tener al menos 2 caracteres",
        code: "VALIDATION_ERROR",
      };
    }

    // Actualizar en Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[updateUserProfile] Supabase error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code || "UPDATE_ERROR",
      };
    }

    return {
      status: "success",
      data: undefined,
      error: null,
    };
  } catch (error) {
    console.error("[updateUserProfile] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}
