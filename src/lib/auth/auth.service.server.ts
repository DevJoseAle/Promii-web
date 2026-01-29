import "server-only";
import { createSupabaseServerClient } from "../supabase/supabase.server";
import { Profile } from "./auth.service.client";


export async function getServerProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, state")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (error) return null;
  return data ?? null;
}
