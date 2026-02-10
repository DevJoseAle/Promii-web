import { CreatePromiiForm } from "./ui/form";
import { COLORS } from "@/config/colors";

export default function CreatePromiiNewPage() {
  return (
    <div className="space-y-6">
      {/* Header con mejor diseño */}
      <div className="flex items-start gap-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.text.primary }}>
            Crear Nuevo Promii
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
            Completa la información para guardar tu Promii como borrador. Podrás editarlo antes de enviarlo a validación.
          </p>
        </div>
      </div>

      <CreatePromiiForm type="new" />
    </div>
  );
}
