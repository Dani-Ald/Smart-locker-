import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { useSegments } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { WalletColors } from '@/constants/theme';

const TABS = [
  { name: 'boletos', href: '/', label: 'Boletos', icon: { default: { ios: 'ticket', android: 'confirmation_number', web: 'confirmation_number' }, selected: { ios: 'ticket.fill', android: 'confirmation_number', web: 'confirmation_number' } } },
  { name: 'explorar', href: '/explorar', label: 'Explorar', icon: { default: { ios: 'safari', android: 'explore', web: 'explore' }, selected: { ios: 'safari', android: 'explore', web: 'explore' } } },
  { name: 'historial', href: '/historial', label: 'Historial', icon: { default: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }, selected: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' } } },
  { name: 'perfil', href: '/perfil', label: 'Perfil', icon: { default: { ios: 'person', android: 'person', web: 'person' }, selected: { ios: 'person.fill', android: 'person', web: 'person' } } },
] as const;

export default function FloatingTabBar() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = WalletColors[scheme];

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <FloatingTabList bottomInset={insets.bottom}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <GlassSurface style={styles.glassBackground} />
          </View>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton label={tab.label} icon={tab.icon} colors={colors} />
            </TabTrigger>
          ))}
          <ActiveNotch selectedIndex={selectedTabIndex(segments)} color={colors} />
        </FloatingTabList>
      </TabList>
    </Tabs>
  );
}

function selectedTabIndex(segments: readonly string[]) {
  const route = segments.find((segment) => TABS.some((tab) => tab.name === segment));
  return Math.max(0, TABS.findIndex((tab) => tab.name === route));
}

function FloatingTabList({ children, bottomInset, ...props }: TabListProps & { bottomInset: number }) {
  return (
    <View {...props} style={[styles.tabListPosition, { bottom: Math.max(10, bottomInset + 8) }]}>
      <View style={styles.tabBar}>
        {children}
      </View>
    </View>
  );
}

function TabButton({ isFocused, label, icon, colors, ...props }: TabTriggerSlotProps & {
  label: string;
  icon: (typeof TABS)[number]['icon'];
  colors: (typeof WalletColors)[keyof typeof WalletColors];
}) {
  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View style={[styles.iconSpace, isFocused && styles.hiddenIcon]}>
        <SymbolView name={isFocused ? icon.selected : icon.default} size={22} tintColor={isFocused ? colors.onPrimary : colors.textSecondary} />
      </View>
      <Text numberOfLines={1} style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function ActiveNotch({ selectedIndex, color }: { selectedIndex: number; color: (typeof WalletColors)[keyof typeof WalletColors] }) {
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(0);
  const position = useSharedValue(selectedIndex);

  useEffect(() => {
    position.value = reduceMotion
      ? withTiming(selectedIndex, { duration: 0 })
      : withSpring(selectedIndex, { damping: 18, stiffness: 180, mass: 0.7 });
  }, [position, reduceMotion, selectedIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    const tabWidth = width.value / TABS.length;
    return {
      opacity: width.value > 0 ? 1 : 0,
      transform: [{ translateX: tabWidth * (position.value + 0.5) - 29 }],
    };
  });

  return (
    <View pointerEvents="none" style={styles.notchTrack} onLayout={(event) => { width.value = event.nativeEvent.layout.width; }}>
      <Animated.View style={[styles.notchHalo, { backgroundColor: color.background }, animatedStyle]}>
        <View style={[styles.activeCircle, { backgroundColor: color.primary, borderColor: color.glassEdge }]}>
          <SymbolView name={TABS[selectedIndex].icon.selected} size={23} tintColor={color.onPrimary} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  tabListPosition: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 16 },
  tabBar: {
    width: '100%', maxWidth: 480, height: 72, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-around',
    borderRadius: 36,
  },
  glassBackground: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 36,
  },
  tabButton: { flex: 1, minWidth: 44, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9, zIndex: 1 },
  iconSpace: { height: 27, alignItems: 'center', justifyContent: 'center' },
  hiddenIcon: { opacity: 0 },
  label: { maxWidth: '100%', marginTop: 2, fontSize: 10, fontWeight: '600' },
  notchTrack: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'visible' },
  notchHalo: {
    position: 'absolute', top: -22, left: 0, width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
  },
  activeCircle: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  pressed: { opacity: 0.72 },
});
