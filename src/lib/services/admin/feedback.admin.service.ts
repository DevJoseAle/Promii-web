import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";

export type FeedbackStatus = "open" | "answered" | "closed";
export type FeedbackCategory = "general" | "bug" | "idea" | "support";
export type FeedbackRole = "merchant" | "influencer";

export type FeedbackItem = {
  id: string;
  user_id: string;
  role: FeedbackRole;
  subject: string;
  message: string;
  category: FeedbackCategory;
  rating: number | null;
  status: FeedbackStatus;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }[] | null;
};

export async function getFeedbacks(params?: {
  status?: FeedbackStatus;
  role?: FeedbackRole;
}): Promise<SupabaseResponse<FeedbackItem[]>> {
  try {
    let query = supabaseAdmin
      .from("feedbacks")
      .select("id,user_id,role,subject,message,category,rating,status,admin_response,responded_at,created_at,profiles(first_name,last_name,email)")
      .order("created_at", { ascending: false });

    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.role) {
      query = query.eq("role", params.role);
    }

    const { data, error } = await query;
    if (error) {
      return failure(error.message, "Error al cargar feedbacks", "FETCH_ERROR");
    }

    const normalized = (data ?? []).map((item) => ({
      ...item,
      profiles: item.profiles ?? null,
    })) as FeedbackItem[];

    return success(normalized);
  } catch (err) {
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

export async function respondFeedback(params: {
  id: string;
  response: string | null;
  status: FeedbackStatus;
}): Promise<SupabaseResponse<FeedbackItem>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("feedbacks")
      .update({
        admin_response: params.response,
        status: params.status,
        responded_at: params.response ? new Date().toISOString() : null,
      })
      .eq("id", params.id)
      .select("id,user_id,role,subject,message,category,rating,status,admin_response,responded_at,created_at,profiles(first_name,last_name,email)")
      .single();

    if (error) {
      return failure(error.message, "Error al responder feedback", "UPDATE_ERROR");
    }

    const normalized = {
      ...data,
      profiles: data?.profiles ?? null,
    } as FeedbackItem;

    return success(normalized);
  } catch (err) {
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}
