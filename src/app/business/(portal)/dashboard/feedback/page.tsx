"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { FeedbackPanel } from "@/components/feedback/feedback-panel";

export default function FeedbackPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-text-secondary">
        Cargando...
      </div>
    );
  }

  return (
    <FeedbackPanel
      role="merchant"
      userId={profile.id}
      title="Feedback de negocios"
      subtitle="Cuéntanos cómo mejorar tu experiencia como comercio."
    />
  );
}
