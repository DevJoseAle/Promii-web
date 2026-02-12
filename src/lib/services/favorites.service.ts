// ═══════════════════════════════════════════════════════════════
// FAVORITES SERVICE (localStorage)
// ═══════════════════════════════════════════════════════════════
// Servicio para gestionar favoritos de promiis usando localStorage

const FAVORITES_KEY_PREFIX = "promii:favorites";

// ─────────────────────────────────────────────────────────────
// HELPER: Obtener la key de localStorage para un usuario
// ─────────────────────────────────────────────────────────────
function getFavoritesKey(userId: string): string {
  return `${FAVORITES_KEY_PREFIX}:${userId}`;
}

// ─────────────────────────────────────────────────────────────
// GET: Obtener array de IDs de promiis favoritos
// ─────────────────────────────────────────────────────────────
export function getFavorites(userId: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const key = getFavoritesKey(userId);
    const stored = window.localStorage.getItem(key);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Validar que sea un array de strings
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      return parsed;
    }

    console.warn("[getFavorites] Invalid format, resetting");
    return [];
  } catch (error) {
    console.error("[getFavorites] Error reading from localStorage:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// ADD: Agregar un promii a favoritos
// ─────────────────────────────────────────────────────────────
export function addFavorite(userId: string, promiiId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = getFavoritesKey(userId);
    const current = getFavorites(userId);

    // Evitar duplicados
    if (current.includes(promiiId)) {
      console.log("[addFavorite] Already in favorites");
      return true;
    }

    // Agregar al principio (más reciente primero)
    const updated = [promiiId, ...current];

    window.localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("[addFavorite] Error saving to localStorage:", error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// REMOVE: Quitar un promii de favoritos
// ─────────────────────────────────────────────────────────────
export function removeFavorite(userId: string, promiiId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = getFavoritesKey(userId);
    const current = getFavorites(userId);

    const updated = current.filter((id) => id !== promiiId);

    window.localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("[removeFavorite] Error saving to localStorage:", error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK: Ver si un promii está en favoritos
// ─────────────────────────────────────────────────────────────
export function isFavorite(userId: string, promiiId: string): boolean {
  const favorites = getFavorites(userId);
  return favorites.includes(promiiId);
}

// ─────────────────────────────────────────────────────────────
// TOGGLE: Agregar o quitar dependiendo del estado actual
// ─────────────────────────────────────────────────────────────
export function toggleFavorite(userId: string, promiiId: string): boolean {
  const isCurrentlyFavorite = isFavorite(userId, promiiId);

  if (isCurrentlyFavorite) {
    return removeFavorite(userId, promiiId);
  } else {
    return addFavorite(userId, promiiId);
  }
}

// ─────────────────────────────────────────────────────────────
// COUNT: Obtener cantidad de favoritos
// ─────────────────────────────────────────────────────────────
export function getFavoritesCount(userId: string): number {
  return getFavorites(userId).length;
}

// ─────────────────────────────────────────────────────────────
// CLEAR: Limpiar todos los favoritos (útil para testing)
// ─────────────────────────────────────────────────────────────
export function clearFavorites(userId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = getFavoritesKey(userId);
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("[clearFavorites] Error:", error);
    return false;
  }
}
