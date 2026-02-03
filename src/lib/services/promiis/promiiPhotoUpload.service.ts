import { getSupabaseBrowserClient } from "@/lib/supabase.ssr";

export type PromiiPhotoRow = {
  id: string;
  promii_id: string;
  merchant_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
};

const BUCKET = "promii";

function extFromFile(file: File) {
  const name = file.name || "";
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "jpg";
}

function safeFileNameBase(file: File) {
  // evita caracteres raros
  return (file.name || "photo")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "_")
    .slice(0, 40);
}

export async function uploadPromiiPhotos(params: {
  promiiId: string;
  merchantId: string; // DEBE ser auth.uid()
  files: File[]; // min 1, max 4
  upsert?: boolean; // útil para edit
}) {
  const { promiiId, merchantId, files, upsert = true } = params;

  if (!files.length) throw new Error("Debes subir al menos 1 foto.");
  if (files.length > 4) throw new Error("Máximo 4 fotos.");

  const supabase = getSupabaseBrowserClient();

  // ✅ Verifica sesión real (evita “me da 403 y no sé por qué”)
  const { data: sess } = await supabase.auth.getSession();
  const authedId = sess.session?.user?.id;

  if (!authedId) throw new Error("No hay sesión activa para subir fotos.");
  if (authedId !== merchantId) {
    throw new Error(
      "MerchantId no coincide con tu sesión. (Debe ser tu auth.uid())."
    );
  }

  // 1) subir a storage (secuencial -> más estable)
  const uploaded: Array<{ path: string; publicUrl: string; sort_order: number }> =
    [];

  try {
    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      if (!file.type.startsWith("image/")) {
        throw new Error("Solo puedes subir imágenes.");
      }

      const ext = extFromFile(file);
      const base = safeFileNameBase(file);

      // ✅ path debe calzar con policy:
      // promiis/{auth.uid()}/{promiiId}/...
      const path = `${merchantId}/${promiiId}/${idx + 1}_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert,
          contentType: file.type || "image/*",
        });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push({ path, publicUrl: data.publicUrl, sort_order: idx + 1 });
    }

    // 2) insertar filas en promii_photos
    const { data: rows, error: insertErr } = await supabase
      .from("promii_photos")
      .insert(
        uploaded.map((u) => ({
          promii_id: promiiId,
          merchant_id: merchantId,
          storage_path: u.path,
          public_url: u.publicUrl,
          sort_order: u.sort_order,
        }))
      )
      .select("id,promii_id,merchant_id,storage_path,public_url,sort_order")
      .order("sort_order", { ascending: true });

    if (insertErr) throw insertErr;

    return (rows ?? []) as PromiiPhotoRow[];
  } catch (err) {
    // ✅ rollback storage si algo falla (db o storage)
    if (uploaded.length) {
      await supabase.storage.from(BUCKET).remove(uploaded.map((u) => u.path));
    }
    throw err;
  }
}

export async function fetchPromiiPhotos(promiiId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("promii_photos")
    .select("id,promii_id,merchant_id,storage_path,public_url,sort_order")
    .eq("promii_id", promiiId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PromiiPhotoRow[];
}

export async function deletePromiiPhoto(photo: PromiiPhotoRow) {
  const supabase = getSupabaseBrowserClient();

  // borrar storage primero
  const { error: stErr } = await supabase.storage
    .from(BUCKET)
    .remove([photo.storage_path]);

  if (stErr) throw stErr;

  // luego borrar db
  const { error: dbErr } = await supabase
    .from("promii_photos")
    .delete()
    .eq("id", photo.id);

  if (dbErr) throw dbErr;
}
