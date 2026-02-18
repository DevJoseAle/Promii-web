
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";

export function InfluencerPendingBanner() {
  const { profile, user } = useAuth();

  const needsApproval = profile?.role === "influencer" && profile?.state === "pending";
  const userWithConfirmation = user as { email_confirmed_at?: string | null; confirmed_at?: string | null } | null;
  const emailConfirmed = !!userWithConfirmation?.email_confirmed_at || !!userWithConfirmation?.confirmed_at;

  if (!needsApproval) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="font-semibold">Tu cuenta está en revisión</div>
      <div className="text-sm text-text-secondary">
        Puedes explorar tu dashboard, pero no podrás activar funciones hasta ser aprobado.
        {!emailConfirmed ? " Además, confirma tu correo para evitar bloqueos." : null}
      </div>

      <div className="mt-3">
        <Button asChild className="bg-primary text-white hover:bg-primary/90">
          <a href="https://wa.me/XXXXXXXXXXX" target="_blank" rel="noreferrer">
            Hablar por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
