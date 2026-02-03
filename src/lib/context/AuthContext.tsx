"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../supabase.ssr";

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

const AuthContext = React.createContext<AuthState | null>(null);

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

  // const fetchProfile = useCallback(
  //   async (userId: string) => {
  //     const { data, error } = await supabase
  //       .from("profiles")
  //       .select("id,email,role,state,first_name,last_name")
  //       .eq("id", userId)
  //       .maybeSingle();

  //     if (error) {
  //       console.warn("[Auth] profile fetch error:", error.message);
  //       setProfile(null);
  //       return;
  //     }

  //     const nextProfile = (data as Profile) ?? null;
  //     setProfile(nextProfile);

  //     // ✅ Cache SOLO si es merchant y hay estado
  //     if (nextProfile?.role === "merchant") {
  //       writeMerchantStateToCache((nextProfile.state ?? "unknown") as any);
  //     }
  //   },
  //   [supabase],
  // );

  const fetchProfile = useCallback(async (userId: string) => {
  console.log("[Auth] fetching profile for:", userId);

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,state,first_name,last_name")
    .eq("id", userId)
    .maybeSingle();

  console.log("[Auth] profile res:", { data, error });

  if (error) {
    console.warn("[Auth] profile fetch error:", error.message);
    setProfile(null);
    return;
  }

  setProfile((data as Profile) ?? null);
}, [supabase]);
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

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;

      try {
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.warn("[Auth] init error:", e);
        setProfile(null);
      } finally {
        setLoading(false); // ✅ SIEMPRE
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
  if (!mounted) return;

  try {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      await fetchProfile(session.user.id);
    } else {
      setProfile(null);
    }
  } catch (e) {
    console.warn("[Auth] listener error:", e);
    setProfile(null);
  } finally {
    setLoading(false); // ✅ SIEMPRE
  }
});

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
