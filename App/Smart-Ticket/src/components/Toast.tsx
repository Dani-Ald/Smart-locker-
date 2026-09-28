/**
 * Toast.tsx — Sistema global de notificaciones toast (Fase 7.2).
 *
 * Uso:
 *   import Toast from '@/components/Toast';
 *
 *   // Mostrar toast de éxito
 *   Toast.success('¡Evento creado!', 'Ya aparece en el catálogo.');
 *
 *   // Mostrar toast de error
 *   Toast.error('Sin conexión', 'Revisa tu red e intenta de nuevo.');
 *
 *   // Mostrar toast informativo
 *   Toast.info('Actualización disponible', 'La app se recargará en breve.');
 *
 * Montar el componente <ToastRoot /> una sola vez en el root layout.
 */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import RNToast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
  ToastConfigParams,
} from 'react-native-toast-message';

import { Brand, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

// ── Tipos de toast personalizados ────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

// ── Helpers de color por tipo ────────────────────────────────────────────────

const TYPE_META: Record<ToastType, { accent: string; icon: string }> = {
  success: { accent: Brand.success, icon: '✅' },
  error:   { accent: Brand.error,   icon: '❌' },
  info:    { accent: Brand.blue,    icon: 'ℹ️' },
  warning: { accent: Brand.warning, icon: '⚠️' },
};

// ── Toast personalizado (render) ─────────────────────────────────────────────

function CustomToast({
  text1,
  text2,
  type = 'info',
}: ToastConfigParams<unknown> & { type: string }) {
  const meta = TYPE_META[type as ToastType] ?? TYPE_META.info;

  return (
    <View style={[styles.container, { borderLeftColor: meta.accent }]}>
      <Text style={styles.icon}>{meta.icon}</Text>
      <View style={styles.textBlock}>
        {!!text1 && <Text style={styles.title} numberOfLines={2}>{text1}</Text>}
        {!!text2 && <Text style={styles.subtitle} numberOfLines={3}>{text2}</Text>}
      </View>
    </View>
  );
}

// ── Configuración de tipos ────────────────────────────────────────────────────

export const toastConfig: ToastConfig = {
  success: (props) => <CustomToast {...props} type="success" />,
  error:   (props) => <CustomToast {...props} type="error" />,
  info:    (props) => <CustomToast {...props} type="info" />,
  warning: (props) => <CustomToast {...props} type="warning" />,
};

// ── Componente raíz — montar en _layout.tsx ──────────────────────────────────

export function ToastRoot() {
  return (
    <RNToast
      config={toastConfig}
      topOffset={Platform.OS === 'ios' ? 56 : 40}
      visibilityTime={3500}
      position="top"
    />
  );
}

// ── API de conveniencia ───────────────────────────────────────────────────────

const Toast = {
  /**
   * Toast de éxito (verde).
   * @param title    Mensaje principal (obligatorio)
   * @param subtitle Mensaje secundario (opcional)
   */
  success(title: string, subtitle?: string) {
    RNToast.show({ type: 'success', text1: title, text2: subtitle });
  },

  /**
   * Toast de error (rojo).
   * @param title    Mensaje principal (obligatorio)
   * @param subtitle Detalle del error (opcional)
   */
  error(title: string, subtitle?: string) {
    RNToast.show({ type: 'error', text1: title, text2: subtitle });
  },

  /**
   * Toast informativo (azul).
   * @param title    Mensaje principal (obligatorio)
   * @param subtitle Detalle (opcional)
   */
  info(title: string, subtitle?: string) {
    RNToast.show({ type: 'info', text1: title, text2: subtitle });
  },

  /**
   * Toast de advertencia (amarillo).
   * @param title    Mensaje principal (obligatorio)
   * @param subtitle Detalle (opcional)
   */
  warning(title: string, subtitle?: string) {
    RNToast.show({ type: 'warning', text1: title, text2: subtitle });
  },

  /** Ocultar el toast activo. */
  hide() {
    RNToast.hide();
  },
};

export default Toast;

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    marginHorizontal: Spacing.three,
    gap: Spacing.two,
    minHeight: 56,
    ...Shadow.modal,
  },
  icon: {
    fontSize: 18,
    marginTop: 1,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#111827',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: '#6B7280',
    lineHeight: 18,
  },
});
