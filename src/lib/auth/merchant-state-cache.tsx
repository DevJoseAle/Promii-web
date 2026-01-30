export type MerchantState = "pending" | "active" | "rejected" | "unknown";

const KEY = "promii:merchantState:v1";

export function readMerchantState(): MerchantState {
  if (typeof window === "undefined") return "unknown";
  const raw = window.localStorage.getItem(KEY);
  if (raw === "pending" || raw === "active" || raw === "rejected") return raw;
  return "unknown";
}

export function writeMerchantState(state: MerchantState) {
  if (typeof window === "undefined") return;
  if (!state || state === "unknown") return;
  window.localStorage.setItem(KEY, state);
}

export function clearMerchantState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
