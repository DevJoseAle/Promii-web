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
  _debugState: () => void; // ✅ Nueva función para debugging
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

      _debugState: () => {
        const state = get();
        console.group("🔍 [AuthStore] Debug State");
        console.log("Status:", state.status);
        console.log("Has hydrated:", state._hasHydrated);
        console.log("Is initializing:", state._isInitializing);
        console.log("Exist session:", state.existSession);
        console.log("Session:", state.session ? {
          userId: state.session.user.id,
          email: state.session.user.email,
          expiresAt: state.session.expires_at,
        } : null);
        console.log("User:", state.user ? {
          id: state.user.id,
          email: state.user.email,
        } : null);
        console.log("Profile:", state.profile ? {
          id: state.profile.id,
          email: state.profile.email,
          role: state.profile.role,
          state: state.profile.state,
        } : null);

        // Verificar localStorage
        if (typeof window !== "undefined") {
          const persistedAuth = window.localStorage.getItem("promii:auth");
          const supabaseAuth = window.localStorage.getItem("promii:supabase.auth");
          console.log("Persisted auth store:", persistedAuth ? "exists" : "empty");
          console.log("Supabase auth:", supabaseAuth ? "exists" : "empty");
        }
        console.groupEnd();
      },

      initialize: async () => {
        // ═══════════════════════════════════════════════════════════════
        // INICIALIZACIÓN SIMPLIFICADA (sin duplicar trabajo)
        // ═══════════════════════════════════════════════════════════════
        // ✅ onAuthStateChange dispara INITIAL_SESSION automáticamente
        // ✅ INITIAL_SESSION maneja TODA la lógica de auth
        // ✅ Solo marcamos estado inicial y esperamos el evento

        if (get()._isInitializing) {
          console.log("[AuthStore] ⚠️  Initialize: already in progress, skipping");
          return;
        }

        const cachedProfile = get().profile;

        console.log("[AuthStore] 🚀 Initialize: starting", {
          hasCachedProfile: !!cachedProfile,
          willWaitForEvent: "INITIAL_SESSION",
        });

        // Mostrar cached profile optimísticamente mientras esperamos INITIAL_SESSION
        if (cachedProfile) {
          console.log("[AuthStore] 💾 Using cached profile optimistically");
          set({
            status: "loading",
            profile: cachedProfile,
            _isInitializing: true,
          });
        } else {
          set({
            status: "loading",
            _isInitializing: true,
          });
        }

        // ✅ INITIAL_SESSION event se encargará del resto
        console.log("[AuthStore] ⏳ Waiting for INITIAL_SESSION event...");

        // ⏰ TIMEOUT DE MONITOREO (solo warning, no force logout)
        // Si después de 10s aún está initializing, algo puede estar mal
        setTimeout(() => {
          const currentState = get();
          if (currentState._isInitializing) {
            console.warn(
              "⚠️  [AuthStore] Initialize: Still initializing after 10s",
              {
                status: currentState.status,
                hasSession: !!currentState.session,
                hasProfile: !!currentState.profile,
                suggestion: "Check if onAuthStateChange listener is registered",
                debug: "Call useAuthStore.getState()._debugState() for details",
              }
            );
          }
        }, 10000);
      },

      fetchProfile: async (userId: string): Promise<Profile | null> => {
        // ✅ GUARD: Validar userId
        if (!userId || typeof userId !== "string") {
          console.error("[AuthStore] fetchProfile: Invalid userId", { userId });
          return null;
        }

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id,email,role,state,first_name,last_name")
            .eq("id", userId)
            .maybeSingle();

          if (error) {
            console.error("[AuthStore] fetchProfile: Database error", {
              code: error.code,
              message: error.message,
              hint: error.hint,
              details: error.details,
            });
            return null;
          }

          if (!data) {
            console.warn("[AuthStore] fetchProfile: Profile not found", { userId });
            return null;
          }

          const profile = data as Profile;

          // ✅ VALIDAR: Profile tiene campos mínimos
          if (!profile.id || !profile.email || !profile.role) {
            console.error("[AuthStore] fetchProfile: Invalid profile structure", {
              hasId: !!profile.id,
              hasEmail: !!profile.email,
              hasRole: !!profile.role,
            });
            return null;
          }

          // Cache merchant state para redirects más rápidos
          if (profile.role === "merchant" && profile.state) {
            writeMerchantStateToCache(profile.state);
          }

          return profile;
        } catch (e) {
          console.error("[AuthStore] fetchProfile: Unexpected error", {
            error: e instanceof Error ? e.message : String(e),
            userId,
          });
          return null;
        }
      },

      refreshProfile: async () => {
        const { user, fetchProfile } = get();

        if (!user?.id) {
          console.warn("[AuthStore] refreshProfile: No user, skipping");
          return;
        }

        console.log("[AuthStore] refreshProfile: Fetching latest profile", {
          userId: user.id,
        });

        const profile = await fetchProfile(user.id);

        if (profile) {
          set({ profile });
          console.log("[AuthStore] refreshProfile: ✅ Updated successfully");
        } else {
          console.warn("[AuthStore] refreshProfile: ⚠️  Failed to fetch profile");
        }
      },

      signOut: async () => {
        console.log("[AuthStore] 🚪 signOut: Starting logout process");

        const hadSession = !!get().session;

        try {
          // Intentar logout en Supabase
          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error("[AuthStore] signOut: Supabase error", {
              code: error.message,
              willClearLocally: true,
            });
          } else {
            console.log("[AuthStore] signOut: ✅ Supabase logout successful");
          }
        } catch (e) {
          console.error("[AuthStore] signOut: Unexpected error", {
            error: e instanceof Error ? e.message : String(e),
            willClearLocally: true,
          });
        }

        // Limpiar caches
        clearMerchantStateCache();

        // Limpiar estado de Zustand
        set({
          status: "unauthenticated",
          session: null,
          user: null,
          profile: null,
          existSession: false,
          _hasHydrated: true,
          _isInitializing: false,
        });

        // Limpiar persistencia
        try {
          await useAuthStore.persist.clearStorage();
          console.log("[AuthStore] signOut: ✅ Cleared Zustand persistence");
        } catch (e) {
          console.warn("[AuthStore] signOut: Error clearing Zustand storage", e);
        }

        // Limpiar storage de Supabase (extra seguridad)
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(SUPABASE_STORAGE_KEY);
            console.log("[AuthStore] signOut: ✅ Cleared Supabase storage");
          } catch (e) {
            console.warn("[AuthStore] signOut: Error clearing Supabase storage", e);
          }
        }

        console.log("[AuthStore] 🚪 signOut: Complete", {
          hadSession,
          clearedSuccessfully: true,
        });
      },
    }),
    {
      name: "promii:auth",
      partialize: (state) => ({
        profile: state.profile,
        // ✅ SOLO persistimos profile (dato custom de la app)
        // ❌ NO persistimos session/user (Supabase lo hace automáticamente)
      }),
      onRehydrateStorage: () => (state) => {
        console.log("[AuthStore] Rehydrated from storage:", {
          hasProfile: !!state?.profile,
        });
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

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Manejar sesión autenticada (usado por SIGNED_IN e INITIAL_SESSION)
  // ═══════════════════════════════════════════════════════════════
  const handleAuthenticatedSession = async (
    session: Session,
    eventName: string
  ) => {
    // ✅ GUARD: Validar que session tiene estructura válida
    if (!session?.user?.id) {
      console.error(`[AuthStore] ${eventName}: Invalid session structure`, { session });
      useAuthStore.setState({
        status: "unauthenticated",
        session: null,
        user: null,
        profile: null,
        existSession: false,
        _isInitializing: false,
      });
      return;
    }

    const { fetchProfile } = useAuthStore.getState();
    const currentState = useAuthStore.getState();

    console.log(`[AuthStore] ${eventName}: Handling authenticated session`, {
      userId: session.user.id,
      email: session.user.email,
      hasCachedProfile: !!currentState.profile,
      cachedProfileMatch: currentState.profile?.id === session.user.id,
    });

    // Optimización: si ya tenemos el perfil correcto, no refetch
    if (
      currentState.profile?.id === session.user.id &&
      currentState.status === "authenticated"
    ) {
      console.log(`[AuthStore] ${eventName}: Using existing profile, updating session only`);
      useAuthStore.setState({
        session,
        user: session.user,
        existSession: true,
        _isInitializing: false,
      });
      return;
    }

    // Fetch profile desde DB
    try {
      const profile = await fetchProfile(session.user.id);

      if (profile) {
        // ✅ VALIDAR: Profile tiene estructura mínima válida
        if (!profile.id || !profile.email || !profile.role) {
          console.error(`[AuthStore] ${eventName}: Invalid profile structure`, { profile });
          throw new Error("Profile missing required fields (id, email, or role)");
        }

        console.log(`[AuthStore] ${eventName}: ✅ Profile loaded successfully`, {
          userId: profile.id,
          role: profile.role,
          state: profile.state,
        });

        useAuthStore.setState({
          status: "authenticated",
          session,
          user: session.user,
          profile,
          existSession: true,
          _isInitializing: false,
        });
      } else {
        console.warn(`[AuthStore] ${eventName}: ⚠️  Profile not found in DB`, {
          userId: session.user.id,
          suggestion: "Check if profile was created during sign up",
        });

        useAuthStore.setState({
          status: "authenticated",
          session,
          user: session.user,
          profile: null,
          existSession: true,
          _isInitializing: false,
        });
      }
    } catch (error) {
      console.error(`[AuthStore] ${eventName}: ❌ Error fetching profile:`, {
        error: error instanceof Error ? error.message : String(error),
        userId: session.user.id,
      });

      // Mantener sesión aunque falle el profile (usuario puede recargar)
      useAuthStore.setState({
        status: "authenticated",
        session,
        user: session.user,
        profile: null,
        existSession: true,
        _isInitializing: false,
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // AUTH STATE CHANGE LISTENER
  // ═══════════════════════════════════════════════════════════════
  supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      console.log(`[AuthStore] 🔔 Event: ${event}`, {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      const { fetchProfile } = useAuthStore.getState();

    // ─────────────────────────────────────────────────────────────
    // SIGNED_IN: Usuario acaba de loguearse
    // ─────────────────────────────────────────────────────────────
    if (event === "SIGNED_IN" && session?.user) {
      await handleAuthenticatedSession(session, "SIGNED_IN");
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // INITIAL_SESSION: SIEMPRE se dispara al cargar (con o sin sesión)
    // ─────────────────────────────────────────────────────────────
    if (event === "INITIAL_SESSION") {
      // CASO 1: No hay sesión → usuario no autenticado
      if (!session?.user) {
        console.log("[AuthStore] INITIAL_SESSION: No active session");
        useAuthStore.setState({
          status: "unauthenticated",
          session: null,
          user: null,
          profile: null,
          existSession: false,
          _isInitializing: false,
        });
        return;
      }

      // CASO 2: Hay sesión → delegar a helper
      await handleAuthenticatedSession(session, "INITIAL_SESSION");
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // SIGNED_OUT: Usuario se deslogueó
    // ─────────────────────────────────────────────────────────────
    if (event === "SIGNED_OUT") {
      console.log("[AuthStore] SIGNED_OUT: Clearing all auth state");
      clearMerchantStateCache();

      useAuthStore.setState({
        status: "unauthenticated",
        session: null,
        user: null,
        profile: null,
        existSession: false,
        _isInitializing: false,
      });

      // Limpiar persistencia
      try {
        await useAuthStore.persist.clearStorage();
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(SUPABASE_STORAGE_KEY);
        }
      } catch (error) {
        console.warn("[AuthStore] SIGNED_OUT: Error clearing storage:", error);
      }

      return;
    }

    // ─────────────────────────────────────────────────────────────
    // TOKEN_REFRESHED: Supabase refrescó el JWT automáticamente
    // ─────────────────────────────────────────────────────────────
    if (event === "TOKEN_REFRESHED" && session) {
      console.log("[AuthStore] TOKEN_REFRESHED: Updating session with new tokens");
      useAuthStore.setState({
        session,
        user: session.user,
        existSession: true,
      });
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // USER_UPDATED: Cambió email, password, metadata, etc.
    // ─────────────────────────────────────────────────────────────
    if (event === "USER_UPDATED" && session?.user) {
      console.log("[AuthStore] USER_UPDATED: Refreshing profile from DB");
      try {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          useAuthStore.setState({ profile });
          console.log("[AuthStore] USER_UPDATED: Profile refreshed successfully");
        }
      } catch (error) {
        console.error("[AuthStore] USER_UPDATED: Error fetching profile:", error);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // Otros eventos (PASSWORD_RECOVERY, etc.)
    // ─────────────────────────────────────────────────────────────
    console.log(`[AuthStore] Unhandled event: ${event}`);

    } catch (error) {
      // ✅ SAFETY: Si hay un error en el event handler, no romper toda la app
      console.error(`[AuthStore] 💥 Uncaught error in ${event} handler:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        event,
        hasSession: !!session,
      });

      // Si el error fue durante initialize, marcar como fallido
      if (useAuthStore.getState()._isInitializing) {
        useAuthStore.setState({
          _isInitializing: false,
          status: "unauthenticated",
        });
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// 🛠️  DEBUGGING TOOLS
// ═══════════════════════════════════════════════════════════════
// Para debuggear el estado de auth en el browser console:
//
// 1. Ver estado completo:
//    useAuthStore.getState()._debugState()
//
// 2. Ver estado actual:
//    useAuthStore.getState()
//
// 3. Forzar refresh de profile:
//    useAuthStore.getState().refreshProfile()
//
// 4. Ver solo profile:
//    useAuthStore.getState().profile
//
// 5. Ver session con tokens:
//    useAuthStore.getState().session
//
// ═══════════════════════════════════════════════════════════════
