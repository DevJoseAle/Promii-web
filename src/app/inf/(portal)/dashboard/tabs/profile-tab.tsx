"use client";

import { useState, useEffect } from "react";
import { UserCircle, Save, Camera, Instagram, Youtube, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { supabase } from "@/lib/supabase/supabase.client";
import { ToastService } from "@/lib/toast/toast.service";
import { VE_STATES, getCitiesForState } from "@/config/location";
import { CATEGORIES } from "@/config/categories";
import { IVzlaCity } from "@/config/types/locations";
import Image from "next/image";

interface ProfileTabProps {
  influencerId: string;
}

type InfluencerProfile = {
  display_name: string;
  bio: string;
  state: string;
  city: string;
  niche: string;
  instagram_handle: string;
  tiktok_handle?: string;
  youtube_handle?: string;
  twitter_handle?: string;
  avatar_url?: string;
  followers_count?: number;
};

export function ProfileTab({ influencerId }: ProfileTabProps) {
  const [profile, setProfile] = useState<InfluencerProfile>({
    display_name: "",
    bio: "",
    state: "",
    city: "",
    niche: "",
    instagram_handle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cities, setCities] = useState<IVzlaCity[]>([]);

  useEffect(() => {
    loadProfile();
  }, [influencerId]);

  useEffect(() => {
    if (profile.state) {
      setCities(getCitiesForState(profile.state));
    }
  }, [profile.state]);

  async function loadProfile() {
    setLoading(true);

    const { data, error } = await supabase
      .from("influencers")
      .select("*")
      .eq("id", influencerId)
      .single();

    if (error) {
      console.error("[loadProfile] Error:", error);
      ToastService.showErrorToast("Error al cargar perfil");
    } else if (data) {
      setProfile({
        display_name: data.display_name || "",
        bio: data.bio || "",
        state: data.state || "",
        city: data.city || "",
        niche: data.niche || "",
        instagram_handle: data.instagram_handle || "",
        tiktok_handle: data.tiktok_handle || "",
        youtube_handle: data.youtube_handle || "",
        twitter_handle: data.twitter_handle || "",
        avatar_url: data.avatar_url || "",
        followers_count: data.followers_count || 0,
      });
    }

    setLoading(false);
  }

  async function handleSave() {
    // Validation
    if (!profile.display_name.trim()) {
      ToastService.showErrorToast("El nombre es requerido");
      return;
    }
    if (!profile.state) {
      ToastService.showErrorToast("El estado es requerido");
      return;
    }
    if (!profile.city) {
      ToastService.showErrorToast("La ciudad es requerida");
      return;
    }
    if (!profile.instagram_handle.trim()) {
      ToastService.showErrorToast("El Instagram es requerido");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("influencers")
      .update({
        display_name: profile.display_name.trim(),
        bio: profile.bio.trim(),
        state: profile.state,
        city: profile.city,
        niche: profile.niche,
        instagram_handle: profile.instagram_handle.trim().replace("@", ""),
        tiktok_handle: profile.tiktok_handle?.trim().replace("@", ""),
        youtube_handle: profile.youtube_handle?.trim().replace("@", ""),
        twitter_handle: profile.twitter_handle?.trim().replace("@", ""),
      })
      .eq("id", influencerId);

    if (error) {
      console.error("[handleSave] Error:", error);
      ToastService.showErrorToast("Error al guardar perfil");
    } else {
      ToastService.showSuccessToast("Perfil actualizado");
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>Cargando perfil...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Avatar Section */}
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
          Foto de Perfil
        </h3>

        <div className="flex items-center gap-6">
          <div className="relative size-24 rounded-full overflow-hidden border-2" style={{ borderColor: COLORS.border.light }}>
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" />
            ) : (
              <div className="size-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lighter }}>
                <UserCircle className="size-12" style={{ color: COLORS.primary.main }} />
              </div>
            )}
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              disabled
              style={{
                borderColor: COLORS.border.main,
                color: COLORS.text.secondary,
              }}
            >
              <Camera className="size-4 mr-2" />
              Cambiar foto (próximamente)
            </Button>
            <p className="text-xs mt-2" style={{ color: COLORS.text.tertiary }}>
              JPG, PNG o GIF. Máximo 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
          Información Básica
        </h3>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              Nombre de influencer <span style={{ color: COLORS.error.main }}>*</span>
            </label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
                color: COLORS.text.primary,
              }}
              placeholder="Tu nombre como influencer"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              Biografía
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border resize-none"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
                color: COLORS.text.primary,
              }}
              placeholder="Cuéntale a las marcas sobre ti..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
              {profile.bio.length}/500 caracteres
            </p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                Estado <span style={{ color: COLORS.error.main }}>*</span>
              </label>
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value, city: "" })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
              >
                <option value="">Selecciona</option>
                {VE_STATES.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                Ciudad <span style={{ color: COLORS.error.main }}>*</span>
              </label>
              <select
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
                disabled={!profile.state}
              >
                <option value="">Selecciona</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Niche */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              Nicho / Categoría
            </label>
            <select
              value={profile.niche}
              onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
                color: COLORS.text.primary,
              }}
            >
              <option value="">Selecciona tu nicho</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
          Redes Sociales
        </h3>

        <div className="space-y-4">
          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              <Instagram className="inline size-4 mr-1" />
              Instagram <span style={{ color: COLORS.error.main }}>*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-lg border" style={{ backgroundColor: COLORS.background.secondary, borderColor: COLORS.border.light, color: COLORS.text.secondary }}>
                @
              </span>
              <input
                type="text"
                value={profile.instagram_handle}
                onChange={(e) => setProfile({ ...profile, instagram_handle: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
                placeholder="tu_usuario"
              />
            </div>
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              TikTok
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-lg border" style={{ backgroundColor: COLORS.background.secondary, borderColor: COLORS.border.light, color: COLORS.text.secondary }}>
                @
              </span>
              <input
                type="text"
                value={profile.tiktok_handle || ""}
                onChange={(e) => setProfile({ ...profile, tiktok_handle: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
                placeholder="tu_usuario"
              />
            </div>
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              <Youtube className="inline size-4 mr-1" />
              YouTube
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-lg border" style={{ backgroundColor: COLORS.background.secondary, borderColor: COLORS.border.light, color: COLORS.text.secondary }}>
                @
              </span>
              <input
                type="text"
                value={profile.youtube_handle || ""}
                onChange={(e) => setProfile({ ...profile, youtube_handle: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
                placeholder="tu_canal"
              />
            </div>
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              <Twitter className="inline size-4 mr-1" />
              Twitter / X
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-lg border" style={{ backgroundColor: COLORS.background.secondary, borderColor: COLORS.border.light, color: COLORS.text.secondary }}>
                @
              </span>
              <input
                type="text"
                value={profile.twitter_handle || ""}
                onChange={(e) => setProfile({ ...profile, twitter_handle: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
                placeholder="tu_usuario"
              />
            </div>
          </div>

          {/* Followers Count */}
          {profile.followers_count !== undefined && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                Seguidores totales (aproximado)
              </label>
              <input
                type="number"
                value={profile.followers_count}
                onChange={(e) => setProfile({ ...profile, followers_count: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
                placeholder="50000"
                min="0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-8"
          style={{
            backgroundColor: COLORS.primary.main,
            color: COLORS.text.inverse,
          }}
        >
          {saving ? (
            <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
