import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export default function BusinessPendingPage() {
  return (
    <AuthShell
      title="Promii Empresas"
      subtitle="Tu solicitud está en revisión. Te notificaremos cuando esté aprobada."
      badgeText="Portal · Promii Empresas"
    >
      <AuthCard heading="Solicitud en revisión" subheading="Gracias por postular tu negocio">
        <div className="space-y-4 text-sm text-text-secondary">
          <p>
            Estamos revisando tu información para proteger a los usuarios y mantener Promii confiable.
          </p>
          <Button asChild className="w-full bg-primary text-white hover:bg-primary/90">
            <Link href="/">Volver al Home</Link>
          </Button>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
