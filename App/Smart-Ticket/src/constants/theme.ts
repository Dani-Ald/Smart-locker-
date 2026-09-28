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
  fast:   150,
  normal: 250,
  slow:   400,
} as const;
