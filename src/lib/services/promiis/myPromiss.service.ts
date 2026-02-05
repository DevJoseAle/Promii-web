import { PromiiCreatePayload, PromiiRow, PromiiStatus } from "@/config/types/promiis";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";
import { supabase } from "@/lib/supabase/supabase.client";
import { PostgrestError } from "@supabase/supabase-js";

//Instacias y Mapeadores

function normalizeSupabaseError(err: any) {
  const e = err as PostgrestError & { code?: string; details?: string; hint?: string };
  return {
    error: e?.message ?? "Error desconocido",
    message: e?.details ?? e?.hint ?? undefined,
    code: (e as any)?.code ?? undefined,
  };
}

export async function fetchMyPromiis(params: {
  merchantId: string;
  status?: PromiiStatus | PromiiStatus[];
  q?: string;
  page?: number;      // 1-based
  pageSize?: number;  // default 10
}): Promise<
  SupabaseResponse<{
    rows: PromiiRow[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  try {
    const { merchantId, status, q = "", page = 1, pageSize = 10 } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("promiis")
      .select(
        "id,merchant_id,status,title,price_amount,price_currency,discount_label,start_at,end_at,state,city,created_at",
        { count: "exact" }
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (Array.isArray(status) && status.length) query = query.in("status", status);
    else if (status) query = query.eq("status", status);

    const needle = q.trim();
    if (needle) query = query.ilike("title", `%${needle}%`);

    const { data, error, count } = await query;
    if (error) {
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    return success({
      rows: (data as PromiiRow[]) ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}


/* ------------------------------------------
   Create Promii
------------------------------------------- */
export async function createPromii(
  payload: PromiiCreatePayload
): Promise<SupabaseResponse<{ id: string; status: PromiiStatus }>> {
  try {
    const { data, error } = await supabase
      .from("promiis")
      .insert(payload)
      .select("id,status")
      .single();

    if (error) {
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    return success({ id: data.id, status: data.status }, "Promii guardado");
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/* ------------------------------------------
   Pause / Activate
------------------------------------------- */
export async function pausePromii(
  promiiId: string,
  merchantId: string
): Promise<SupabaseResponse<{ id: string; status: PromiiStatus }>> {
  try {
    const { data, error } = await supabase
      .from("promiis")
      .update({ status: "paused" })
      .eq("id", promiiId)
      .eq("merchant_id", merchantId)
      .select("id,status")
      .single();

    if (error) {
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    return success({ id: data.id, status: data.status }, "Promii pausado");
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

export async function activatePromii(
  promiiId: string,
  merchantId: string
): Promise<SupabaseResponse<{ id: string; status: PromiiStatus }>> {
  try {
    const { data, error } = await supabase
      .from("promiis")
      .update({ status: "active" })
      .eq("id", promiiId)
      .eq("merchant_id", merchantId)
      .select("id,status")
      .single();

    if (error) {
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    return success({ id: data.id, status: data.status }, "Promii activado");
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}
