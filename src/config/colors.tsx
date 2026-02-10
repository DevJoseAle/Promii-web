/**
 * Sistema de colores de Promii
 * Mobile-first design system
 */

export const COLORS = {
  // Marca principal (basado en el azul existente)
  primary: {
    main: "#2d68e8",      // Azul principal (botones, links principales)
    light: "#4f86ff",     // Azul secundario (hover, highlights)
    lighter: "#e8f0ff",   // Fondos sutiles, badges
    dark: "#1a4bc4",      // Botones pressed, textos importantes
    darker: "#0d2d7a",    // Headers, contraste alto
  },

  // Colores semánticos
  success: {
    main: "#10b981",      // Verde éxito (promii activo, validaciones OK)
    light: "#34d399",     // Hover
    lighter: "#d1fae5",   // Fondos
    dark: "#059669",      // Texto
  },

  warning: {
    main: "#f59e0b",      // Naranja (promii pausado, alertas)
    light: "#fbbf24",
    lighter: "#fef3c7",
    dark: "#d97706",
  },

  error: {
    main: "#ef4444",      // Rojo (errores, promii rechazado)
    light: "#f87171",
    lighter: "#fee2e2",
    dark: "#dc2626",
  },

  info: {
    main: "#3b82f6",      // Azul info (tooltips, ayudas)
    light: "#60a5fa",
    lighter: "#dbeafe",
    dark: "#2563eb",
  },

  // Neutrales (grises)
  neutral: {
    50: "#fafafa",        // Fondos muy claros
    100: "#f5f5f5",       // Fondos de cards
    200: "#e5e5e5",       // Bordes suaves
    300: "#d4d4d4",       // Bordes normales
    400: "#a3a3a3",       // Texto deshabilitado
    500: "#737373",       // Texto secundario
    600: "#525252",       // Texto normal
    700: "#404040",       // Texto importante
    800: "#262626",       // Texto muy importante
    900: "#171717",       // Casi negro
  },

  // Backgrounds
  background: {
    primary: "#ffffff",    // Fondo principal
    secondary: "#f9fafb",  // Fondo alternativo (sidebar, sections)
    tertiary: "#f3f4f6",   // Fondo de inputs, cards secundarias
    dark: "#1f2937",       // Fondo oscuro (futuro dark mode)
  },

  // Bordes
  border: {
    light: "#e5e7eb",      // Bordes sutiles
    main: "#d1d5db",       // Bordes normales
    dark: "#9ca3af",       // Bordes con énfasis
  },

  // Texto
  text: {
    primary: "#111827",    // Texto principal
    secondary: "#6b7280",  // Texto secundario
    tertiary: "#9ca3af",   // Texto deshabilitado
    inverse: "#ffffff",    // Texto sobre fondos oscuros
  },

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",  // Para modales, drawers

  // Legacy (mantener compatibilidad)
  bluePrimary: "#2d68e8",
  blueSecondary: "#4f86ff",
} as const;

export type ColorTokens = typeof COLORS;