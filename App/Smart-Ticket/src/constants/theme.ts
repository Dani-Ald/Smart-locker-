/**
 * theme.ts — Design tokens centralizados de Smart Ticket.
 *
 * Fase 7.1: Ampliado con paleta de marca, tipografía semántica,
 * radios, sombras y utilidades de spacing.
 */

import { Platform } from 'react-native';

// ── Paleta de marca ──────────────────────────────────────────────────────────

export const Brand = {
  /** Azul principal */
  blue:      '#208AEF',
  /** Azul oscuro (pressed / disabled) */
  blueDark:  '#1A6EC4',
  /** Azul extra claro (fondos de badge) */
  blueLight: '#E0F0FF',

  /** Colores de categoría */
  feria:    '#b45309',
  baile:    '#7c3aed',
  palenque: '#991b1b',
  charreada:'#065f46',
  jaripeo:  '#9a3412',

  /** Estados semánticos */
  success: '#059669',
  error:   '#dc2626',
  warning: '#d97706',
  info:    '#0284c7',
} as const;

// ── Colores de tema (light / dark) ───────────────────────────────────────────

export const Colors = {
  light: {
    text:                '#111827',
    textSecondary:       '#6B7280',
    background:          '#FFFFFF',
    backgroundElement:   '#F3F4F6',
    backgroundSelected:  '#E5E7EB',
    border:              '#E5E7EB',
    cardShadow:          '#000000',
  },
  dark: {
    text:                '#F9FAFB',
    textSecondary:       '#9CA3AF',
    background:          '#0F0F0F',
    backgroundElement:   '#1C1C1E',
    backgroundSelected:  '#2C2C2E',
    border:              '#2C2C2E',
    cardShadow:          '#000000',
  },
} as const;

/** Paleta de la experiencia de autenticación. */
export const AuthColors = {
  light: {
    background: '#F0F4F8',
    backgroundTop: '#F9FDFF',
    backgroundMiddle: '#DCEEFF',
    backgroundBottom: '#B9D9FF',
    orbPrimary: 'rgba(30, 96, 255, 0.10)',
    orbSecondary: 'rgba(125, 211, 252, 0.18)',
    ambientBlue: 'rgba(37, 99, 235, 0.34)',
    ambientCyan: 'rgba(103, 232, 249, 0.38)',
    ambientWhite: 'rgba(255, 255, 255, 0.72)',
    lightBeam: 'rgba(255, 255, 255, 0.24)',
    surface: 'rgba(255, 255, 255, 0.94)',
    surfaceSolid: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    glassSurface: 'rgba(255, 255, 255, 0.34)',
    glassFallback: 'rgba(241, 248, 255, 0.76)',
    glassBorder: 'rgba(255, 255, 255, 0.82)',
    glassHighlight: 'rgba(255, 255, 255, 0.42)',
    inputGlass: 'rgba(255, 255, 255, 0.46)',
    inputGlassFocused: 'rgba(255, 255, 255, 0.72)',
    inputBorder: 'rgba(255, 255, 255, 0.78)',
    border: 'rgba(226, 232, 240, 0.86)',
    borderFocused: '#1E60FF',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#1E60FF',
    primaryEnd: '#0052FF',
    onPrimary: '#FFFFFF',
    primarySoft: 'rgba(255, 255, 255, 0.22)',
    shadow: '#52647A',
    primaryShadow: '#1E60FF',
    error: '#DC2626',
    errorSurface: '#FEF2F2',
    errorBorder: '#FECACA',
    success: '#047857',
    successSurface: '#ECFDF5',
    successBorder: '#A7F3D0',
    warning: '#D97706',
    logoPearl: '#F8FBFF',
    logoHighlight: '#FFFFFF',
    logoShade: '#DCE7F4',
    socialIcon: '#111827',
  },
  dark: {
    background: '#09111F',
    backgroundTop: '#07172E',
    backgroundMiddle: '#0A2A52',
    backgroundBottom: '#102A4B',
    orbPrimary: 'rgba(30, 96, 255, 0.22)',
    orbSecondary: 'rgba(56, 189, 248, 0.12)',
    ambientBlue: 'rgba(37, 99, 235, 0.46)',
    ambientCyan: 'rgba(34, 211, 238, 0.24)',
    ambientWhite: 'rgba(191, 219, 254, 0.18)',
    lightBeam: 'rgba(219, 234, 254, 0.10)',
    surface: 'rgba(15, 27, 46, 0.96)',
    surfaceSolid: '#111D30',
    surfaceMuted: '#162338',
    glassSurface: 'rgba(15, 34, 62, 0.42)',
    glassFallback: 'rgba(10, 29, 53, 0.86)',
    glassBorder: 'rgba(191, 219, 254, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    inputGlass: 'rgba(15, 40, 70, 0.56)',
    inputGlassFocused: 'rgba(21, 52, 91, 0.78)',
    inputBorder: 'rgba(191, 219, 254, 0.22)',
    border: 'rgba(100, 116, 139, 0.32)',
    borderFocused: '#6B9AFF',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    primary: '#3975FF',
    primaryEnd: '#1459F5',
    onPrimary: '#FFFFFF',
    primarySoft: 'rgba(255, 255, 255, 0.18)',
    shadow: '#000000',
    primaryShadow: '#1E60FF',
    error: '#FCA5A5',
    errorSurface: '#321820',
    errorBorder: '#7F1D1D',
    success: '#6EE7B7',
    successSurface: '#12372F',
    successBorder: '#286454',
    warning: '#FCD34D',
    logoPearl: '#E8EFF8',
    logoHighlight: '#FFFFFF',
    logoShade: '#B8C8DC',
    socialIcon: '#F8FAFC',
  },
} as const;

export type AuthPalette = typeof AuthColors.light | typeof AuthColors.dark;

export const WalletColors = {
  light: {
    glass: 'rgba(247, 251, 255, 0.93)',
    glassEdge: '#FFFFFF',
    glassLight: 'rgba(255, 255, 255, 0.8)',
    cyan: 'rgba(111, 231, 236, 0.24)',
    violet: 'rgba(165, 116, 248, 0.12)',
    pink: 'rgba(243, 180, 214, 0.18)',
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EAF0F7',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#DFE7F1',
    primary: '#1E60FF',
    primaryEnd: '#0052FF',
    primarySoft: '#E8F0FF',
    onPrimary: '#FFFFFF',
    success: '#047857',
    successSoft: '#D1FAE5',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
    shadow: '#334155',
    qrBackground: '#FFFFFF',
    qrForeground: '#0F172A',
  },
  dark: {
    background: '#08111F',
    glass: 'rgba(20, 40, 63, 0.94)',
    glassEdge: '#3C536E',
    glassLight: 'rgba(236, 246, 255, 0.09)',
    cyan: 'rgba(111, 231, 236, 0.15)',
    violet: 'rgba(165, 116, 248, 0.15)',
    pink: 'rgba(243, 180, 214, 0.09)',
    surface: '#111D30',
    surfaceMuted: '#18263B',
    text: '#F8FAFC',
    textSecondary: '#A8B6C8',
    border: '#2A3A52',
    primary: '#5B8CFF',
    primaryEnd: '#1459F5',
    primarySoft: '#182D57',
    onPrimary: '#FFFFFF',
    success: '#6EE7B7',
    successSoft: '#12372F',
    warning: '#FCD34D',
    warningSoft: '#3B2D13',
    danger: '#FCA5A5',
    dangerSoft: '#3B1D24',
    shadow: '#000000',
    qrBackground: '#FFFFFF',
    qrForeground: '#0F172A',
  },
} as const;

export type WalletPalette = typeof WalletColors.light | typeof WalletColors.dark;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Tipo unificado que acepta tanto light como dark — usar en props de componentes */
export type AppColors = typeof Colors.light | typeof Colors.dark;

// ── Tipografía ───────────────────────────────────────────────────────────────

export const FontSize = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

export const FontWeight = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
  heavy:   '800',
  black:   '900',
} as const;

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
} as const;

/** Familias de fuente por plataforma */
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    'var(--font-display)',
    serif:   'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono:    'var(--font-mono)',
  },
});

// ── Spacing (escala 4-pt) ────────────────────────────────────────────────────

export const Spacing = {
  /** 2 px */  half:  2,
  /** 4 px */  one:   4,
  /** 8 px */  two:   8,
  /** 16 px */ three: 16,
  /** 24 px */ four:  24,
  /** 32 px */ five:  32,
  /** 64 px */ six:   64,
} as const;

// ── Radios ───────────────────────────────────────────────────────────────────

export const Radius = {
  glass: 28,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 9999,
} as const;

// ── Sombras por plataforma ───────────────────────────────────────────────────

export const Shadow = {
  /** Sombra suave para cards */
  card: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOpacity: 0.07,
      shadowRadius:  10,
      shadowOffset:  { width: 0, height: 3 },
    },
    android: { elevation: 3 },
    default: {},
  }),
  /** Sombra para modales / overlays */
  modal: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOpacity: 0.15,
      shadowRadius:  20,
      shadowOffset:  { width: 0, height: 8 },
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

// ── Constantes de layout ─────────────────────────────────────────────────────

/** Espacio reservado para el tab bar en iOS/Android */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Ancho máximo del contenido en tablets / web */
export const MaxContentWidth = 800;

// ── Duración de animaciones ──────────────────────────────────────────────────

export const Duration = {
  ticket: 1000,
  fast:   150,
  normal: 250,
  slow:   400,
} as const;
