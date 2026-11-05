import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import type { WalletTicket } from '@/types/ticket';

export type HoloTicketVariant = 'featured' | 'compact' | 'detail';

type Props = {
  ticket: WalletTicket;
  variant?: HoloTicketVariant;
  now: number;
  animated?: boolean;
  qrComponent?: React.ReactNode;
};

const COLOR_STOPS = [
  '#cccccc',
  '#ff6bfe',
  '#00f9f8',
  '#dddddd',
  '#0081fd',
  '#eef0bc',
  '#0081fd',
  '#ff6bfe',
  '#1a1a2e',
  '#0081fd',
  '#dddddd',
  '#01fefb',
  '#cccccc',
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColors(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = c1[0] + factor * (c2[0] - c1[0]);
  const g = c1[1] + factor * (c2[1] - c1[1]);
  const b = c1[2] + factor * (c2[2] - c1[2]);
  return rgbToHex(r, g, b);
}

function getConicColor(t: number): string {
  const normalized = ((t % 1) + 1) % 1;
  const count = COLOR_STOPS.length - 1;
  const scaled = normalized * count;
  const index = Math.min(Math.floor(scaled), count - 1);
  const factor = scaled - index;
  return interpolateColors(COLOR_STOPS[index], COLOR_STOPS[index + 1], factor);
}

function generateConicSlices(cx: number, cy: number, radius: number, numSlices = 48) {
  const slices = [];
  for (let i = 0; i < numSlices; i++) {
    const a1 = (i / numSlices) * 2 * Math.PI;
    const a2 = ((i + 1) / numSlices) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(a1);
    const y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    const path = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
    const color = getConicColor((i + 0.5) / numSlices);
    slices.push(<Path key={i} d={path} fill={color} opacity={0.88} />);
  }
  return slices;
}

function generateBarcodeLines(seedString: string, count = 26) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const lines = [];
  let currentX = 0;
  for (let i = 0; i < count; i++) {
    const bit = Math.abs((hash ^ (i * 1664525 + 1013904223)) % 4) + 1;
    const gap = (i % 3 === 0) ? 2 : 1.5;
    lines.push(
      <Rect
        key={i}
        x={currentX}
        y={0}
        width={bit}
        height={28}
        fill="#111111"
        rx={0.5}
      />
    );
    currentX += bit + gap;
  }
  return { lines, totalWidth: currentX };
}

export function HoloTicket({
  ticket,
  variant = 'compact',
  now,
  animated = false,
  qrComponent,
}: Props) {
  const isCompact = variant === 'compact';
  const isDetail = variant === 'detail';
  const { width: windowWidth } = useWindowDimensions();

  const width = Math.min(isCompact ? 330 : isDetail ? 340 : 280, windowWidth - Spacing.four * 2);
  const height = isCompact ? 175 : isDetail ? 530 : 440;
  const cutoutY = isCompact ? 115 : 120;
  const perfRadius = 5;
  const perfSpacing = 16;
  const notchRadius = 10;

  const date = new Date(ticket.evento.fechaHora);
  const formattedDate = Number.isNaN(date.getTime())
    ? 'Fecha por confirmar'
    : new Intl.DateTimeFormat('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);

  const past = date.getTime() < now;
  const active = !past && ticket.estado === 'pagado' && !!ticket.qrPayload;
  const statusLabel = active ? 'Listo' : past ? 'Finalizado' : ticket.estado;

  const shimmerPos = useSharedValue(0);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPos.value * (width + 160) - 80 }],
  }));

  useEffect(() => {
    if (!animated) {
      shimmerPos.value = 0;
      return undefined;
    }
    shimmerPos.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => {
      shimmerPos.value = 0;
    };
  }, [animated, shimmerPos]);

  const conicSlices = useMemo(() => {
    const cx = width * 0.6;
    const cy = height * 0.5;
    const radius = Math.max(width, height) * 1.2;
    return generateConicSlices(cx, cy, radius, 42);
  }, [width, height]);

  const topCircles = useMemo(() => {
    const circles = [];
    for (let x = perfSpacing; x < width; x += perfSpacing) {
      circles.push(<Circle key={`top-${x}`} cx={x} cy={0} r={perfRadius} fill="black" />);
    }
    return circles;
  }, [width]);

  const bottomCircles = useMemo(() => {
    const circles = [];
    for (let x = perfSpacing; x < width; x += perfSpacing) {
      circles.push(<Circle key={`bot-${x}`} cx={x} cy={height} r={perfRadius} fill="black" />);
    }
    return circles;
  }, [width, height]);

  const barcode = useMemo(() => {
    return generateBarcodeLines(ticket.id, isCompact ? 22 : 30);
  }, [ticket.id, isCompact]);

  const folioSuffix = useMemo(() => {
    const clean = ticket.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return clean.slice(-4) || 'TKT';
  }, [ticket.id]);
  const svgId = `${ticket.ownerId}-${ticket.id}-${variant}`.replace(/[^a-zA-Z0-9_-]/g, '-');

  return (
    <View style={[styles.container, { width, height }]}>
      {/* SVG Background with Holographic Shader & Perforations */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <Mask id={`holo-mask-${svgId}`}>
              <Rect x={0} y={0} width={width} height={height} rx={Radius.lg} fill="white" />
              {topCircles}
              {bottomCircles}
              <Circle cx={0} cy={cutoutY} r={notchRadius} fill="black" />
              <Circle cx={width} cy={cutoutY} r={notchRadius} fill="black" />
            </Mask>
            <SvgLinearGradient id={`linear-overlay-${svgId}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.65} />
              <Stop offset="50%" stopColor="#ffffff" stopOpacity={0.4} />
              <Stop offset="100%" stopColor="#dbeafe" stopOpacity={0.7} />
            </SvgLinearGradient>
            <RadialGradient id={`pink-glow-${svgId}`} cx="75%" cy="20%" r="60%">
              <Stop offset="0%" stopColor="#ff007f" stopOpacity={0.35} />
              <Stop offset="100%" stopColor="#ff007f" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <G mask={`url(#holo-mask-${svgId})`}>
            {/* Base color background */}
            <Rect x={0} y={0} width={width} height={height} fill="#f0f4f8" />
            {/* Conic slices */}
            <G>{conicSlices}</G>
            {/* Radial glow */}
            <Rect x={0} y={0} width={width} height={height} fill={`url(#pink-glow-${svgId})`} />
            {/* Soft linear overlay for contrast */}
            <Rect x={0} y={0} width={width} height={height} fill={`url(#linear-overlay-${svgId})`} />
          </G>

          {/* Cutout line across notches */}
          <Line
            x1={14}
            y1={cutoutY}
            x2={width - 14}
            y2={cutoutY}
            stroke="#475569"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={0.45}
          />
        </Svg>
      </View>

      {/* Shimmer metallic sweep */}
      {animated ? <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmerWrap,
          { height, width: 80 },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.45)', 'rgba(0, 249, 248, 0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View> : null}

      {/* Background ♪♪♪ Notes Watermark */}
      <View pointerEvents="none" style={styles.watermarkLayer}>
        <Text style={styles.watermarkText}>♪ ♪ ♪ ♪ ♪</Text>
        <Text style={styles.watermarkText}>♪ ♪ ♪ ♪</Text>
        <Text style={styles.watermarkText}>♪ ♪ ♪ ♪ ♪</Text>
      </View>

      {/* Foreground Content */}
      <View style={styles.contentLayer}>
        {/* TOP SECTION / HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandTitle}>SMART TICKET</Text>
            <Text style={styles.brandSub}>VALLE DEL MEZQUITAL</Text>
          </View>
          <View style={styles.scissorsWrap}>
            <Text style={styles.scissorsText}>✂</Text>
          </View>
          <View style={[styles.statusBadge, active ? styles.statusActive : styles.statusMuted]}>
            <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextMuted]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* MIDDLE SECTION / BODY */}
        {isCompact ? (
          <View style={styles.compactBody}>
            <View style={styles.compactMain}>
              <Text numberOfLines={1} style={styles.eventNameCompact}>
                {ticket.evento.nombre}
              </Text>
              <Text numberOfLines={1} style={styles.ticketTypeItalic}>
                {ticket.tipoBoleto}
              </Text>
              <View style={styles.metaRowInline}>
                <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={13} tintColor="#1e293b" />
                <Text numberOfLines={1} style={styles.metaTextCompact}>
                  {formattedDate}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.fullBody}>
            <Text style={styles.ticketTypeItalic}>{ticket.tipoBoleto}</Text>
            <Text numberOfLines={2} style={styles.eventNameFull}>
              {ticket.evento.nombre}
            </Text>

            {isDetail && qrComponent ? (
              <View style={styles.detailContent}>
                <View style={styles.qrContainer}>{qrComponent}</View>
                <View style={styles.metaBlock}>
                  <View style={styles.metaRow}>
                    <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={16} tintColor="#0f172a" />
                    <Text numberOfLines={1} style={styles.metaTextFull}>{formattedDate}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={16} tintColor="#0f172a" />
                    <Text numberOfLines={1} style={styles.metaTextSecondary}>{ticket.evento.ubicacion || ticket.evento.municipio}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.metaBlock}>
                <View style={styles.metaRow}>
                  <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={16} tintColor="#0f172a" />
                  <Text numberOfLines={1} style={styles.metaTextFull}>
                    {formattedDate}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={16} tintColor="#0f172a" />
                  <Text numberOfLines={1} style={styles.metaTextSecondary}>
                    {ticket.evento.ubicacion || ticket.evento.municipio}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* BOTTOM SECTION / FOOTER */}
        <View style={styles.footerRow}>
          <View style={styles.folioPill}>
            <Text style={styles.folioLabel}>SEAT / FOLIO</Text>
            <Text style={styles.folioValue}>{folioSuffix}</Text>
          </View>

          <View style={styles.barcodeWrap}>
            <Svg width={barcode.totalWidth} height={28}>
              {barcode.lines}
            </Svg>
          </View>

          {!isDetail && !isCompact && (
            <View style={styles.openPill}>
              <Text style={styles.openText}>VER</Text>
              <SymbolView name={{ ios: 'arrow.up.right', android: 'north_east', web: 'north_east' }} size={14} tintColor="#0f172a" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
    alignSelf: 'center',
  },
  shimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  watermarkLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-around',
    alignItems: 'center',
    opacity: 0.08,
    zIndex: 2,
    paddingVertical: Spacing.four,
  },
  watermarkText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 6,
  },
  contentLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 3,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.8,
    color: '#0f172a',
  },
  brandSub: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    color: '#475569',
  },
  scissorsWrap: {
    transform: [{ rotate: '185deg' }],
    opacity: 0.45,
  },
  scissorsText: {
    fontSize: 18,
    color: '#0f172a',
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusMuted: {
    backgroundColor: '#e2e8f0',
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  statusTextActive: {
    color: '#15803d',
  },
  statusTextMuted: {
    color: '#475569',
  },
  compactBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.one,
  },
  compactMain: {
    gap: 2,
  },
  eventNameCompact: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  metaRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: 2,
  },
  metaTextCompact: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: '#334155',
  },
  fullBody: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  detailContent: { flex: 1, minHeight: 0 },
  ticketTypeItalic: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    fontWeight: FontWeight.semibold,
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  eventNameFull: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.heavy,
    color: '#0f172a',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  metaBlock: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaTextFull: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#0f172a',
  },
  metaTextSecondary: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: '#334155',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  folioPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  folioLabel: {
    fontSize: 8,
    fontWeight: FontWeight.bold,
    color: '#64748b',
    letterSpacing: 0.8,
  },
  folioValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.heavy,
    color: '#0f172a',
  },
  barcodeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  openText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#0f172a',
  },
});
