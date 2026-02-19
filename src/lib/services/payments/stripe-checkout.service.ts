"use client";

import { supabase } from "@/lib/supabase/supabase.client";
import type { BillingType, PlanId } from "@/lib/payments/types";

type CheckoutResponse = {
  checkoutUrl: string;
};

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error("No hay sesión activa. Recarga la página.");
  }
  return token;
}

export async function createPlanStripeCheckout(params: {
  plan: PlanId;
  billingType: BillingType;
}): Promise<CheckoutResponse> {
  const token = await getAuthToken();
  const res = await fetch("/api/payments/create-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan: params.plan,
      billingType: params.billingType,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Error al generar el link de pago");
  }
  return data as CheckoutResponse;
}

export async function createPromiiStripeCheckout(params: {
  promiiId: string;
  referralCode?: string | null;
}): Promise<CheckoutResponse> {
  const token = await getAuthToken();
  const res = await fetch("/api/payments/create-promii-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      promiiId: params.promiiId,
      referralCode: params.referralCode ?? null,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Error al generar el link de pago");
  }
  return data as CheckoutResponse;
}
