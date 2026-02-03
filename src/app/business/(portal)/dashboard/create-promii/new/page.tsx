import { CreatePromiiForm } from "./ui/form";

export default function CreatePromiiNewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Nuevo Promii
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Completa la información para guardar tu Promii como borrador.
        </p>
      </div>

      <CreatePromiiForm type="new" />
    </div>
  );
}
