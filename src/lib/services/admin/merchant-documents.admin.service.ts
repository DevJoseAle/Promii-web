import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";

export type DocumentType = "rif" | "registro_mercantil" | "cedula" | "otro";
export type FileType = "pdf" | "image" | "other";

export type MerchantDocument = {
  id: string;
  merchant_id: string;
  file_name: string;
  // NOTE: file_url stores storage path for private bucket access.
  file_url: string;
  file_type: FileType;
  file_size: number | null;
  document_type: DocumentType | null;
  notes: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  created_at: string;
};

/**
 * Obtiene todos los documentos de un merchant
 */
export async function getMerchantDocuments(
  merchantId: string
): Promise<SupabaseResponse<MerchantDocument[]>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_get_merchant_documents", {
      p_merchant_id: merchantId,
    });

    if (error) {
      console.error("[getMerchantDocuments] RPC error:", error);
      return failure(error.message, "Error al obtener documentos", "RPC_ERROR");
    }

    return success(data as MerchantDocument[]);
  } catch (err) {
    console.error("[getMerchantDocuments] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Sube un documento a Supabase Storage
 */
export async function uploadMerchantDocument(
  merchantId: string,
  file: File,
  documentType: DocumentType,
  notes: string,
  uploadedBy: string
): Promise<SupabaseResponse<MerchantDocument>> {
  try {
    // Determinar tipo de archivo
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const isPdf = fileExt === "pdf";
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt || "");
    const fileType: FileType = isPdf ? "pdf" : isImage ? "image" : "other";

    // Subir a Storage
    // Bucket `merchant-documents` debe ser PRIVATE. Usar signed URLs para acceso.
    const fileName = `${merchantId}/${documentType}_${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("merchant-documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadMerchantDocument] Upload error:", uploadError);
      return failure(uploadError.message, "Error al subir archivo", "UPLOAD_ERROR");
    }

    // Crear registro en la base de datos
    const { data: createData, error: createError } = await supabaseAdmin.rpc(
      "admin_create_merchant_document",
      {
        p_merchant_id: merchantId,
        p_file_name: file.name,
        p_file_url: fileName,
        p_file_type: fileType,
        p_file_size: file.size,
        p_document_type: documentType,
        p_notes: notes || null,
        p_uploaded_by: uploadedBy,
      }
    );

    if (createError) {
      // Si falla la creación del registro, eliminar el archivo
      await supabaseAdmin.storage.from("merchant-documents").remove([fileName]);
      console.error("[uploadMerchantDocument] Create error:", createError);
      return failure(createError.message, "Error al registrar documento", "CREATE_ERROR");
    }

    if (!createData || !createData.success) {
      // Si falla la creación del registro, eliminar el archivo
      await supabaseAdmin.storage.from("merchant-documents").remove([fileName]);
      return failure("Error al registrar documento", "No se pudo crear el registro", "CREATE_ERROR");
    }

    // Obtener el documento recién creado
    const documentsResponse = await getMerchantDocuments(merchantId);
    if (documentsResponse.status === "success") {
      const newDocument = documentsResponse.data.find(
        (doc) => doc.id === createData.document_id
      );
      if (newDocument) {
        return success(newDocument);
      }
    }

    // Fallback: retornar datos básicos
    return success({
      id: createData.document_id,
      merchant_id: merchantId,
      file_name: file.name,
      file_url: fileName,
      file_type: fileType,
      file_size: file.size,
      document_type: documentType,
      notes: notes || null,
      uploaded_by: uploadedBy,
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as MerchantDocument);
  } catch (err) {
    console.error("[uploadMerchantDocument] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Elimina un documento (de la base de datos y de Storage)
 */
export async function deleteMerchantDocument(
  documentId: string,
  fileUrl: string
): Promise<SupabaseResponse<void>> {
  try {
    // Eliminar de la base de datos
    const { data, error } = await supabaseAdmin.rpc("admin_delete_merchant_document", {
      p_document_id: documentId,
    });

    if (error) {
      console.error("[deleteMerchantDocument] RPC error:", error);
      return failure(error.message, "Error al eliminar documento", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo eliminar", "DELETE_ERROR");
    }

    // Extraer el path del archivo (si viene URL, convertir a path)
    let filePath = fileUrl;
    try {
      if (fileUrl.startsWith("http")) {
        const url = new URL(fileUrl);
        const pathMatch = url.pathname.match(/\/merchant-documents\/(.+)$/);
        if (pathMatch && pathMatch[1]) filePath = pathMatch[1];
      }
      await supabaseAdmin.storage.from("merchant-documents").remove([filePath]);
    } catch (storageError) {
      console.warn("[deleteMerchantDocument] Storage cleanup error:", storageError);
      // No fallar si no se puede eliminar de storage
    }

    return success(undefined);
  } catch (err) {
    console.error("[deleteMerchantDocument] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Solicita un signed URL (expira rápido) para descargar un documento.
 * El acceso se valida en el server.
 */
export async function getMerchantDocumentSignedUrl(
  documentId: string
): Promise<SupabaseResponse<{ signedUrl: string }>> {
  try {
    const res = await fetch("/api/merchant-documents/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return failure(err?.error || "No autorizado", "Error al generar URL", "SIGNED_URL_ERROR");
    }

    const data = (await res.json()) as { signedUrl: string };
    return success({ signedUrl: data.signedUrl });
  } catch (err) {
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}
