import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { NextResponse } from "next/server";


export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  // Redirige a home o donde quieras
  return NextResponse.json({ ok: true });
}
