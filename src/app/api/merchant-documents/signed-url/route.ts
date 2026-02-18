import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { createServiceRoleClient } from "@/lib/supabase/supabase.service-role";

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    const caller = authData?.user;

    if (authError || !caller) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const documentId = body?.documentId as string | undefined;
    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Fetch document metadata
    const { data: doc, error: docError } = await supabase
      .from("merchant_documents")
      .select("id, merchant_id, file_url")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Authorization: admin or owning merchant
    if (caller.id !== doc.merchant_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", caller.id)
        .single();

      if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Resolve storage path (file_url may be a path or an old public URL)
    let filePath = doc.file_url as string;
    if (filePath.startsWith("http")) {
      try {
        const url = new URL(filePath);
        const pathMatch = url.pathname.match(/\/merchant-documents\/(.+)$/);
        if (pathMatch && pathMatch[1]) filePath = pathMatch[1];
      } catch {
        return NextResponse.json({ error: "Invalid document path" }, { status: 400 });
      }
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from("merchant-documents")
      .createSignedUrl(filePath, 600);

    if (signedError || !signed?.signedUrl) {
      return NextResponse.json({ error: "Signed URL failed" }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: signed.signedUrl });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
