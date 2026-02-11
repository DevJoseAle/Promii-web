import { notFound } from "next/navigation";
import { INFLUENCERS } from "@/mocks/influencers";
import InfluencerProfileClient from "./profile-client";

export default async function InfluencerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const influencer = INFLUENCERS.find((x) => x.slug === slug);
  if (!influencer) return notFound();

  // TODO: Get merchant status from auth
  const isMerchant = false;

  return <InfluencerProfileClient influencer={influencer} isMerchant={isMerchant} />;
}
