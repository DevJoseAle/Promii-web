import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { redirect } from "next/navigation";


export default async function InfluencerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/influencers/sign-in");
  return <>{children}</>;
}
