"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../supabase.ssr";

/* =======================
   Types
======================= */

export type Profile = {
  id: string;
  email: string;
  role: "user" | "merchant" | "influencer" | "admin";
  state?: "pending" | "approved" | "rejected" | "blocked";
  first_name?: string | null;
  last_name?: string | null;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

/* =======================
   Context
======================= */

const AuthContext = React.createContext<AuthState | null>(null);

/* =======================
   Provider
======================= */
type MerchantStateCache =
  | "pending"
  | "approved"
  | "rejected"
  | "blocked"
  | "unknown";
const MERCHANT_STATE_KEY = "promii:merchantState:v1";

function writeMerchantStateToCache(state: MerchantStateCache) {
  if (typeof window === "undefined") return;
  if (state === "unknown") return;
  window.localStorage.setItem(MERCHANT_STATE_KEY, state);
}

function clearMerchantStateCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MERCHANT_STATE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  /* =======================
     Helpers
  ======================= */

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,role,state,first_name,last_name")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("[Auth] profile fetch error:", error.message);
        setProfile(null);
        return;
      }

      const nextProfile = (data as Profile) ?? null;
      setProfile(nextProfile);

      // ✅ Cache SOLO si es merchant y hay estado
      if (nextProfile?.role === "merchant") {
        writeMerchantStateToCache((nextProfile.state ?? "unknown") as any);
      }
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await fetchProfile(data.user.id);
  }, [fetchProfile, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    clearMerchantStateCache();
  }, [supabase]);

  /* =======================
     Init + Auth listener
  ======================= */

  useEffect(() => {
    let mounted = true;

    // 1) Carga inicial desde cookies
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }

      setLoading(false);
    });

    // 2) Listener de auth (login, logout, refresh, callback email)
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  /* =======================
     Context value
  ======================= */

  const value: AuthState = {
    loading,
    session,
    user,
    profile,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* =======================
   Hook
======================= */

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  }
  return ctx;
}
