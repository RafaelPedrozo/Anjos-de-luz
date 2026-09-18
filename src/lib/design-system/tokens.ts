/**
 * Design tokens — Anjos de Luz
 */

export const colors = {
  background: "#FFF8F0",
  surface: "#2F453A",
  card: "#FFFFFF",
  listItem: "#FFF3E6",

  primary: "#F4A261",
  primaryHover: "#E08A45",
  onPrimary: "#2F453A",
  onSurface: "#FFF8F0",

  textPrimary: "#2F453A",
  textSecondary: "#5C7268",
  textMuted: "#8A9A93",

  success: "#2F453A",
  successMuted: "#3D5A4C",
  warning: "#F4A261",
  danger: "#C45C26",

  purple: "#2F453A",
  pink: "#E08A45",
  grayChart: "#8A9A93",

  border: "rgba(47, 69, 58, 0.14)",
  borderSubtle: "rgba(47, 69, 58, 0.08)",

  sidebarActive: "#F4A261",
  sidebarActiveGlow: "rgba(244, 162, 97, 0.35)",
} as const;

export const spacing = {
  sidebarWidth: "240px",
  headerHeight: "88px",
  contentPadding: "32px",
  cardPadding: "24px",
  gapSm: "8px",
  gapMd: "16px",
  gapLg: "24px",
  gapXl: "32px",
} as const;

export const radius = {
  card: "16px",
  button: "12px",
  sidebarItem: "12px",
  avatar: "50%",
  tag: "8px",
} as const;

export const typography = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  sizes: {
    xs: "12px",
    sm: "13px",
    base: "14px",
    md: "15px",
    lg: "18px",
    xl: "24px",
    "2xl": "28px",
    "3xl": "32px",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

export const shadows = {
  card: "0 4px 24px rgba(47, 69, 58, 0.08)",
  primaryCard: "0 8px 32px rgba(244, 162, 97, 0.35)",
  sidebarActive: "0 4px 16px rgba(244, 162, 97, 0.35)",
} as const;

export const transitions = {
  fast: "150ms ease",
  normal: "200ms ease",
  slow: "300ms ease",
} as const;

export type NavItemId =
  | "dashboard"
  | "animais"
  | "adocoes"
  | "doacoes"
  | "relatorios"
  | "configuracoes";

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
}

export const navigationItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "animais", label: "Animais & Resgates", href: "/animais" },
  { id: "adocoes", label: "Adoções", href: "/adocoes" },
  { id: "doacoes", label: "Doações de Dinheiro", href: "/doacoes" },
  { id: "relatorios", label: "Relatórios", href: "/relatorios" },
  { id: "configuracoes", label: "Configurações", href: "/configuracoes" },
];

export const userProfile = {
  name: "João Martins",
  role: "Administrador",
  initials: "JM",
} as const;
