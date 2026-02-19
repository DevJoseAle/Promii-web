import { notFound } from "next/navigation";
import InfluencerProfileClient from "./profile-client";
import {
  getInfluencerByHandle,
  getInfluencerPublicStats,
  getPublicInfluencerOffers,
  getPublicInfluencerBrands,
} from "@/lib/services/influencer/influencer-public.service";

export default async function InfluencerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Buscar influencer por instagram handle
  const response = await getInfluencerByHandle(slug);

  if (response.status !== "success" || !response.data) {
    return notFound();
  }

  const influencer = response.data;

  // Obtener estadísticas públicas
  const stats = await getInfluencerPublicStats(influencer.id);
  const offersResponse = await getPublicInfluencerOffers(influencer.id);
  const offers = offersResponse.status === "success" ? offersResponse.data || [] : [];
  const brandsResponse = await getPublicInfluencerBrands(influencer.id, 10);
  const brands = brandsResponse.status === "success" ? brandsResponse.data || [] : [];

  // Transformar datos al formato que espera el componente cliente
  const influencerData = {
    id: influencer.id,
    name: influencer.display_name,
    slug: influencer.instagram_handle.replace("@", ""),
    handle: influencer.instagram_handle,
    bio: influencer.bio || "Creador de contenido verificado en Promii",
    city: influencer.city,
    followers: 0, // Followers not available in DB yet
    tags: [influencer.niche_primary, influencer.niche_secondary].filter(Boolean) as string[],
    avatarUrl: influencer.avatar_url || undefined,
    tiktokHandle: influencer.tiktok_handle || undefined,
    youtubeHandle: influencer.youtube_handle || undefined,
    totalPromiis: stats.totalPromiis,
    totalBrands: stats.totalBrands,
  };

  // TODO: Get merchant status from auth
  const isMerchant = false;

  return (
    <InfluencerProfileClient
      influencer={influencerData}
      offers={offers}
      brands={brands}
      isMerchant={isMerchant}
    />
  );
}
