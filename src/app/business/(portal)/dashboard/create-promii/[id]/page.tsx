import { supabase } from "@/lib/supabase/supabase.client";
import { CreatePromiiForm } from "../new/ui/form";


export default async function EditPromiiPage({
  params,
}: {
  params: { id: string };
}) {
  

  const { data: promii, error } = await supabase
    .from("promiis")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !promii) {
    // aquí puedes renderizar un estado "no encontrado"
    return <div>No se encontró el Promii.</div>;
  }

  return (
    <CreatePromiiForm
      type="edit"
      promiiId={params.id}
      initialData={promii}
    />
  );
}
