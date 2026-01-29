import { redirect } from "next/navigation";

export default function MerchantDashboardIndex() {
  redirect("/business/dashboard/validate/pending");
}
