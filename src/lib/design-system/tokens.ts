/**
 * Design tokens — ViaConeta
 * Valores extraídos de rules.txt e referências em design/
 */

export const colors = {
  /** Fundo principal da aplicação */
  background: "#0B0B0F",
  /** Fundo da sidebar e superfícies elevadas */
  surface: "#16161A",
  /** Fundo de cards (rules.txt) */
  card: "#0F1324",
  /** Itens de lista dentro de cards */
  listItem: "#16161D",

  /** Acento primário — item ativo, CTAs, branding */
  primary: "#E60023",
  primaryHover: "#CC001F",

  /** Texto */
  textPrimary: "#FFFFFF",
  textSecondary: "#949494",
  textMuted: "#A0A0A0",

  /** Status */
  success: "#00C853",
  successMuted: "#10B981",
  warning: "#F97316",
  danger: "#E60023",

  purple: "#8B5CF6",
  pink: "#EC4899",
  grayChart: "#6B7280",

  /** Bordas (rules.txt) */
  border: "rgba(255, 255, 255, 0.08)",
  borderSubtle: "rgba(255, 255, 255, 0.05)",

  /** Sidebar item ativo */
  sidebarActive: "#E60023",
  sidebarActiveGlow: "rgba(230, 0, 35, 0.25)",
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
  /** Cards (rules.txt) */
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
  card: "0 4px 24px rgba(0, 0, 0, 0.4)",
  primaryCard: "0 8px 32px rgba(230, 0, 35, 0.3)",
  sidebarActive: "0 4px 16px rgba(230, 0, 35, 0.25)",
} as const;

export const transitions = {
  fast: "150ms ease",
  normal: "200ms ease",
  slow: "300ms ease",
} as const;

export type NavItemId =
  | "dashboard"
  | "entradas"
  | "saidas"
  | "contas-a-pagar"
  | "relatorios"
  | "clientes"
  | "configuracoes";

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
}

export const navigationItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "entradas", label: "Entradas", href: "/entradas" },
  { id: "saidas", label: "Saídas", href: "/saidas" },
  { id: "contas-a-pagar", label: "Contas a Pagar", href: "/contas-a-pagar" },
  { id: "relatorios", label: "Relatórios", href: "/relatorios" },
  { id: "clientes", label: "Clientes", href: "/clientes" },
  { id: "configuracoes", label: "Configurações", href: "/configuracoes" },
];

export const userProfile = {
  name: "João Martins",
  role: "Administrador",
  initials: "JM",
} as const;
