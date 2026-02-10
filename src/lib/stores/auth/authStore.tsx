import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/supabase.client";
import { ProfileRole } from "@/config/types/profile";

export type Profile = {
  id: string;
  email: string;
  role: ProfileRole
  state?: "pending" | "approved" | "rejected" | "blocked";
  first_name?: string | null;
  last_name?: string | null;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  _hasHydrated: boolean;
  _isInitializing: boolean;
  existSession: boolean;

  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

const MERCHANT_STATE_KEY = "promii:merchantState:v1";
const SUPABASE_STORAGE_KEY = "promii:supabase.auth";

function writeMerchantStateToCache(state: string) {
  if (typeof window === "undefined") return;
  if (!state || state === "unknown") return;
  window.localStorage.setItem(MERCHANT_STATE_KEY, state);
}

function clearMerchantStateCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MERCHANT_STATE_KEY);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "loading",
      session: null,
      user: null,
      profile: null,
      _hasHydrated: false,
      _isInitializing: false,
      existSession: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      initialize: async () => {
        // Prevenir múltiples inicializaciones simultáneas
        if (get()._isInitializing) {
          console.log("[AuthStore] Already initializing, skipping...");
          return;
        }

        set({ _isInitializing: true });

        const cachedProfile = get().profile;

        console.log("[AuthStore] Initializing...");

        // Timeout de seguridad: si después de 10s no se resuelve, forzar a unauthenticated
        const timeoutId = setTimeout(() => {
          const currentStatus = get().status;
          if (currentStatus === "loading") {
            console.warn("[AuthStore] Initialization timeout, forcing unauthenticated");
            set({
              status: "unauthenticated",
              session: null,
              user: null,
              profile: null,
              existSession: false,
              _isInitializing: false,
            });
          }
        }, 10000);

        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          clearTimeout(timeoutId);

          if (error) {
            console.warn("[AuthStore] getSession error:", error.message);
            set({
              status: "unauthenticated",
              session: null,
              user: null,
              profile: null,
              existSession: false,
              _isInitializing: false,
            });
            return;
          }

          if (!session?.user) {
            console.log("[AuthStore] No session");
            set({
              status: "unauthenticated",
              session: null,
              user: null,
              profile: null,
              existSession: false,
              _isInitializing: false,
            });
            return;
          }

          set({
            session,
            user: session.user,
            existSession: true,
          });

          if (cachedProfile?.id === session.user.id) {
            console.log("[AuthStore] Using cached profile");
            set({
              status: "authenticated",
              profile: cachedProfile,
              existSession: true,
              _isInitializing: false,
            });

            // refresco en background
            get()
              .fetchProfile(session.user.id)
              .then((freshProfile) => {
                if (freshProfile) set({ profile: freshProfile });
              })
              .catch((err) => {
                console.warn("[AuthStore] Background profile refresh failed:", err);
              });
          } else {
            const profile = await get().fetchProfile(session.user.id);
            set({
              status: "authenticated",
              profile,
              existSession: true,
              _isInitializing: false,
            });
          }

          console.log("[AuthStore] Initialized successfully");
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("[AuthStore] Init error:", error);
          set({
            status: "unauthenticated",
            session: null,
            user: null,
            profile: null,
            existSession: false,
            _isInitializing: false,
          });
        }
      },

      fetchProfile: async (userId: string): Promise<Profile | null> => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id,email,role,state,first_name,last_name")
            .eq("id", userId)
            .maybeSingle();

          if (error) {
            console.warn("[AuthStore] Profile error:", error.message);
            return null;
          }

          const profile = (data as Profile) ?? null;

          if (profile?.role === "merchant" && profile.state) {
            writeMerchantStateToCache(profile.state);
          }

          return profile;
        } catch (e) {
          console.error("[AuthStore] fetchProfile error:", e);
          return null;
        }
      },

      refreshProfile: async () => {
        const { user, fetchProfile } = get();
        if (!user) return;

        const profile = await fetchProfile(user.id);
        set({ profile });
      },

      signOut: async () => {
        console.log("[AuthStore] signOut: start");

        try {
          await supabase.auth.signOut();
        } catch (e) {
          // Igual limpiamos local aunque Supabase falle
          console.warn("[AuthStore] signOut supabase error:", e);
        }

        clearMerchantStateCache();

        set({
          status: "unauthenticated",
          session: null,
          user: null,
          profile: null,
          existSession: false,
          _hasHydrated: true,
        });

        // Borra persist del store
        await useAuthStore.persist.clearStorage();

        // Borra storage de Supabase (extra seguro)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(SUPABASE_STORAGE_KEY);
        }

        console.log("[AuthStore] signOut: done");
      },
    }),
    {
      name: "promii:auth",
      partialize: (state) => ({
        profile: state.profile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

let listenerInitialized = false;

export function initAuthListener() {
  if (listenerInitialized) {
    console.log("[AuthStore] Auth listener already initialized");
    return;
  }
  if (typeof window === "undefined") return;

  listenerInitialized = true;
  console.log("[AuthStore] Initializing auth listener");

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("[AuthStore] Auth event:", event);

    const { fetchProfile } = useAuthStore.getState();

    if (event === "SIGNED_IN" && session?.user) {
      console.log("[AuthStore] User signed in");
      try {
        const profile = await fetchProfile(session.user.id);

        useAuthStore.setState({
          status: "authenticated",
          session,
          user: session.user,
          profile,
          existSession: true,
          _isInitializing: false,
        });
      } catch (error) {
        console.error("[AuthStore] Error fetching profile on SIGNED_IN:", error);
        useAuthStore.setState({
          status: "authenticated",
          session,
          user: session.user,
          profile: null,
          existSession: true,
          _isInitializing: false,
        });
      }
      return;
    }

    if (event === "SIGNED_OUT") {
      console.log("[AuthStore] User signed out");
      clearMerchantStateCache();

      useAuthStore.setState({
        status: "unauthenticated",
        session: null,
        user: null,
        profile: null,
        existSession: false,
        _isInitializing: false,
      });

      try {
        await useAuthStore.persist.clearStorage();
      } catch (error) {
        console.warn("[AuthStore] Error clearing storage:", error);
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SUPABASE_STORAGE_KEY);
      }
      return;
    }

    if (event === "TOKEN_REFRESHED" && session) {
      console.log("[AuthStore] Token refreshed");
      useAuthStore.setState({
        session,
        user: session.user,
        existSession: true,
      });
    }

    if (event === "USER_UPDATED" && session?.user) {
      console.log("[AuthStore] User updated, refreshing profile");
      try {
        const profile = await fetchProfile(session.user.id);
        useAuthStore.setState({ profile });
      } catch (error) {
        console.error("[AuthStore] Error fetching profile on USER_UPDATED:", error);
      }
    }
  });
}
