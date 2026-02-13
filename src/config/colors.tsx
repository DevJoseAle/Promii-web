export const COLORS = {
// Marca principal (Startup moderna, tecnológica y confiable)
primary: {
main: "#46248c",      // Morado oscuro
light: "#d35df3",     // Morado claro
lighter: "#F3E8FF",
dark: "#2d1557",
darker: "#1a0d33",
},

bluePrimary: "#46248c",
blueSecondary: "#d35df3",

// Accent turquesa (para CTAs, precios, botones)
accent: {
main: "#2DD4BF",      // Turquesa principal
light: "#2DD4BF",     // Turquesa claro
lighter: "#CCFBF1",   // Turquesa muy claro
dark: "#0F766E",      // Turquesa oscuro
},

// Discount badge (fucsia vibrante)
discount: {
main: "#ee3a94",      // Fucsia para badges de descuento
light: "#f56bb7",
dark: "#d11d73",
},

// Colores semánticos
success: {
main: "#10B981",
light: "#34D399",
lighter: "#D1FAE5",
dark: "#059669",
},

warning: {
main: "#F59E0B",
light: "#FBBF24",
lighter: "#FEF3C7",
dark: "#D97706",
},

error: {
main: "#EF4444",
light: "#F87171",
lighter: "#FEE2E2",
dark: "#DC2626",
},

info: {
main: "#3B82F6", // coherente con primary
light: "#60A5FA",
lighter: "#DBEAFE",
dark: "#2563EB",
},

// Neutrales más refinados (más premium y menos planos)
neutral: {
50: "#F9FAFB",
100: "#F3F4F6",
200: "#E5E7EB",
300: "#D1D5DB",
400: "#9CA3AF",
500: "#6B7280",
600: "#4B5563",
700: "#374151",
800: "#1F2937",
900: "#111827",
},

// Backgrounds más elegantes
background: {
primary: "#FFFFFF",
secondary: "#F8FAFC", // más moderno que gris plano
tertiary: "#F1F5F9", // inputs y cards suaves
dark: "#0F172A", // dark mode premium
},

// Bordes más suaves y modernos
border: {
light: "#E2E8F0",
main: "#CBD5E1",
dark: "#94A3B8",
},

// Texto optimizado para UI moderna
text: {
primary: "#0F172A",
secondary: "#475569",
tertiary: "#94A3B8",
inverse: "#FFFFFF",
},

overlay: "rgba(15, 23, 42, 0.55)",
} as const;


export type ColorTokens = typeof COLORS;
