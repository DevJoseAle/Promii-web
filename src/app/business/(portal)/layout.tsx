
import { getServerProfile } from "@/lib/auth/auth.service.server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { redirect } from "next/navigation";


export default async function BusinessPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/business/sign-in");
  const profile = await getServerProfile(user.id);
    console.log({
    user,
    profile,
    });
  if (!profile || profile.role !== "merchant") redirect("/business/apply");
  if (profile.state === "blocked") redirect("/business/blocked");
  if (profile.state === "rejected") redirect("/business/rejected");
  return <>{children}</>;
}
