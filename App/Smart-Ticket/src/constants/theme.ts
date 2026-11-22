/**
 * theme.ts — Design tokens centralizados de Smart Ticket.
 *
 * Fase 7.1: Ampliado con paleta de marca, tipografía semántica,
 * radios, sombras y utilidades de spacing.
 */

import { Platform } from 'react-native';

/** Identidad cromática compartida por autenticación, wallet y efectos. */
export const Palette = {
  coldWhite: '#F5FAFF',
  iceBlue: '#EAF4FF',
  pastelBlue: '#C9DCFA',
  skyBlue: '#A9DFFF',
  electricBlue: '#1557FF',
  brightBlue: '#397BFF',
  navy: '#101B35',
  blueGray: '#68798D',
  secondaryText: '#53667D',
  actionEnd: '#2264EF',
  nightAccent: '#91B6FF',
  night: '#0A1428',
  nightSurface: '#13233D',
  nightMuted: '#182C4A',
  nightTextSecondary: '#B3C6DE',
  white: '#FFFFFF',
} as const;

// ── Paleta de marca ──────────────────────────────────────────────────────────

export const Brand = {
  /** Azul principal */
  blue:      Palette.electricBlue,
  /** Azul oscuro (pressed / disabled) */
  blueDark:  '#1045CC',
  /** Azul extra claro (fondos de badge) */
  blueLight: Palette.iceBlue,

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
    text:                Palette.navy,
    textSecondary:       Palette.secondaryText,
    background:          Palette.coldWhite,
    backgroundElement:   Palette.iceBlue,
    backgroundSelected:  Palette.pastelBlue,
    border:              Palette.pastelBlue,
    cardShadow:          Palette.blueGray,
  },
  dark: {
    text:                Palette.coldWhite,
    textSecondary:       Palette.nightTextSecondary,
    background:          Palette.night,
    backgroundElement:   Palette.nightSurface,
    backgroundSelected:  Palette.nightMuted,
    border:              '#314969',
    cardShadow:          Palette.night,
  },
} as const;

/** Paleta de la experiencia de autenticación. */
export const AuthColors = {
  light: {
    background: Palette.coldWhite,
    backgroundTop: Palette.coldWhite,
    backgroundMiddle: Palette.iceBlue,
    backgroundBottom: Palette.pastelBlue,
    orbPrimary: 'rgba(30, 96, 255, 0.10)',
    orbSecondary: 'rgba(125, 211, 252, 0.18)',
    ambientBlue: 'rgba(201, 220, 250, 0.48)',
    ambientCyan: 'rgba(169, 223, 255, 0.38)',
    ambientWhite: 'rgba(255, 255, 255, 0.72)',
    lightBeam: 'rgba(255, 255, 255, 0.24)',
    surface: 'rgba(255, 255, 255, 0.94)',
    surfaceSolid: Palette.coldWhite,
    surfaceMuted: Palette.iceBlue,
    glassSurface: 'rgba(255, 255, 255, 0.34)',
    glassFallback: 'rgba(241, 248, 255, 0.76)',
    glassBorder: 'rgba(255, 255, 255, 0.82)',
    glassHighlight: 'rgba(255, 255, 255, 0.42)',
    inputGlass: 'rgba(255, 255, 255, 0.46)',
    inputGlassFocused: 'rgba(255, 255, 255, 0.72)',
    inputBorder: 'rgba(255, 255, 255, 0.78)',
    border: 'rgba(226, 232, 240, 0.86)',
    borderFocused: Palette.electricBlue,
    text: Palette.navy,
    textSecondary: Palette.secondaryText,
    textMuted: Palette.secondaryText,
    primary: Palette.electricBlue,
    primaryEnd: Palette.actionEnd,
    primaryText: Palette.electricBlue,
    onPrimary: '#FFFFFF',
    primarySoft: 'rgba(255, 255, 255, 0.22)',
    shadow: '#7095C5',
    primaryShadow: Palette.electricBlue,
    error: '#DC2626',
    errorSurface: '#FEF2F2',
    errorBorder: '#FECACA',
    success: '#047857',
    successSurface: '#ECFDF5',
    successBorder: '#A7F3D0',
    warning: '#D97706',
    logoPearl: Palette.coldWhite,
    logoHighlight: '#FFFFFF',
    logoShade: Palette.pastelBlue,
    socialIcon: Palette.navy,
  },
  dark: {
    background: Palette.night,
    backgroundTop: Palette.night,
    backgroundMiddle: Palette.nightSurface,
    backgroundBottom: Palette.nightMuted,
    orbPrimary: 'rgba(30, 96, 255, 0.22)',
    orbSecondary: 'rgba(56, 189, 248, 0.12)',
    ambientBlue: 'rgba(57, 123, 255, 0.20)',
    ambientCyan: 'rgba(169, 223, 255, 0.12)',
    ambientWhite: 'rgba(191, 219, 254, 0.18)',
    lightBeam: 'rgba(219, 234, 254, 0.10)',
    surface: 'rgba(15, 27, 46, 0.96)',
    surfaceSolid: Palette.nightSurface,
    surfaceMuted: Palette.nightMuted,
    glassSurface: 'rgba(15, 34, 62, 0.42)',
    glassFallback: 'rgba(10, 29, 53, 0.86)',
    glassBorder: 'rgba(191, 219, 254, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    inputGlass: 'rgba(15, 40, 70, 0.56)',
    inputGlassFocused: 'rgba(21, 52, 91, 0.78)',
    inputBorder: 'rgba(191, 219, 254, 0.22)',
    border: 'rgba(100, 116, 139, 0.32)',
    borderFocused: '#6B9AFF',
    text: Palette.coldWhite,
    textSecondary: Palette.nightTextSecondary,
    textMuted: '#94A3B8',
    primary: Palette.electricBlue,
    primaryEnd: Palette.actionEnd,
    primaryText: Palette.nightAccent,
    onPrimary: '#FFFFFF',
    primarySoft: 'rgba(255, 255, 255, 0.18)',
    shadow: '#000000',
    primaryShadow: Palette.brightBlue,
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

/** El boleto conserva una superficie clara, también en modo oscuro, para su lectura. */
export const TicketColors = {
  text: Palette.navy,
  secondary: '#465B73',
  muted: Palette.blueGray,
  background: Palette.coldWhite,
  glow: Palette.skyBlue,
  primary: Palette.electricBlue,
  sheen: 'rgba(169, 223, 255, 0.35)',
  pill: 'rgba(245, 250, 255, 0.82)',
  border: 'rgba(16, 27, 53, 0.12)',
  success: '#047857',
  successSoft: '#D1FAE5',
  foil: [
    [Palette.coldWhite, Palette.pastelBlue, Palette.skyBlue, Palette.iceBlue, Palette.pastelBlue, Palette.coldWhite],
    [Palette.iceBlue, Palette.skyBlue, Palette.coldWhite, Palette.pastelBlue, Palette.iceBlue, Palette.iceBlue],
    [Palette.pastelBlue, Palette.coldWhite, Palette.iceBlue, Palette.skyBlue, Palette.coldWhite, Palette.pastelBlue],
  ],
} as const;

export const WalletColors = {
  light: {
    glass: 'rgba(245, 250, 255, 0.93)',
    glassEdge: '#FFFFFF',
    glassLight: 'rgba(255, 255, 255, 0.8)',
    cyan: 'rgba(169, 223, 255, 0.24)',
    violet: 'rgba(201, 220, 250, 0.22)',
    pink: 'rgba(234, 244, 255, 0.30)',
    background: Palette.coldWhite,
    surface: Palette.coldWhite,
    surfaceMuted: Palette.iceBlue,
    text: Palette.navy,
    textSecondary: Palette.secondaryText,
    border: Palette.pastelBlue,
    primary: Palette.electricBlue,
    primaryEnd: Palette.actionEnd,
    primaryText: Palette.electricBlue,
    primarySoft: Palette.iceBlue,
    onPrimary: '#FFFFFF',
    success: '#047857',
    successSoft: '#D1FAE5',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
    shadow: '#7095C5',
    qrBackground: '#FFFFFF',
    qrForeground: '#0F172A',
  },
  dark: {
    background: Palette.night,
    glass: 'rgba(19, 35, 61, 0.94)',
    glassEdge: '#3C536E',
    glassLight: 'rgba(236, 246, 255, 0.09)',
    cyan: 'rgba(169, 223, 255, 0.12)',
    violet: 'rgba(201, 220, 250, 0.08)',
    pink: 'rgba(234, 244, 255, 0.04)',
    surface: Palette.nightSurface,
    surfaceMuted: Palette.nightMuted,
    text: Palette.coldWhite,
    textSecondary: Palette.nightTextSecondary,
    border: '#2A3A52',
    primary: Palette.electricBlue,
    primaryEnd: Palette.actionEnd,
    primaryText: Palette.nightAccent,
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

export const WalletLayout = {
  ticketWidth: 350,
  ticketHeight: 500,
  ticketGap: 12,
  deckSpread: 72,
  deckAngle: 12,
  deckScale: 0.78,
  deckOpen: 250,
  deckHold: 600,
  deckClose: 250,
  tabWidth: 480,
  tourBottomClearance: 112,
  tourScrim: 'rgba(5, 12, 25, 0.16)',
} as const;

// ── Duración de animaciones ──────────────────────────────────────────────────

export const Duration = {
  ticket: 1000,
  fast:   150,
  normal: 250,
  slow:   400,
} as const;
