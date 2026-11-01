import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AuthPalette, Radius } from '@/constants/theme';

type LiquidLoginBackgroundProps = {
  colors: AuthPalette;
};

export function LiquidLoginBackground({ colors }: LiquidLoginBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(drift);
      cancelAnimation(breathe);
      drift.value = 0;
      breathe.value = 0;
      return;
    }

    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 6200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );

    return () => {
      cancelAnimation(drift);
      cancelAnimation(breathe);
    };
  }, [breathe, drift, reduceMotion]);

  const blueStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + breathe.value * 0.2,
    transform: [
      { translateX: drift.value * -26 },
      { translateY: drift.value * 18 },
      { scale: 1 + breathe.value * 0.08 },
      { rotate: '-14deg' },
    ],
  }));

  const cyanStyle = useAnimatedStyle(() => ({
    opacity: 0.66 + drift.value * 0.18,
    transform: [
      { translateX: drift.value * 22 },
      { translateY: drift.value * -16 },
      { scale: 1.04 - breathe.value * 0.05 },
      { rotate: '18deg' },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + breathe.value * 0.22,
    transform: [{ scale: 0.96 + breathe.value * 0.1 }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.backgroundTop, colors.backgroundMiddle, colors.backgroundBottom]}
        end={{ x: 0.75, y: 1 }}
        start={{ x: 0.18, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.blueShape, { backgroundColor: colors.ambientBlue }, blueStyle]} />
      <Animated.View style={[styles.cyanShape, { backgroundColor: colors.ambientCyan }, cyanStyle]} />
      <Animated.View style={[styles.whiteGlow, { backgroundColor: colors.ambientWhite }, glowStyle]} />

      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', colors.lightBeam, 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.beamLeft}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', colors.lightBeam, 'rgba(255, 255, 255, 0)']}
        end={{ x: 0, y: 1 }}
        start={{ x: 1, y: 0 }}
        style={styles.beamRight}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0)']}
        style={styles.topWash}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blueShape: {
    position: 'absolute',
    top: -130,
    right: -160,
    width: 430,
    height: 500,
    borderRadius: Radius.full,
  },
  cyanShape: {
    position: 'absolute',
    bottom: -180,
    left: -190,
    width: 460,
    height: 520,
    borderRadius: Radius.full,
  },
  whiteGlow: {
    position: 'absolute',
    top: '26%',
    left: '8%',
    width: '84%',
    height: 310,
    borderRadius: Radius.full,
  },
  beamLeft: {
    position: 'absolute',
    top: -100,
    left: -40,
    width: 150,
    height: '78%',
    transform: [{ rotate: '-18deg' }],
  },
  beamRight: {
    position: 'absolute',
    top: -130,
    right: -55,
    width: 180,
    height: '70%',
    transform: [{ rotate: '21deg' }],
  },
  topWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '34%',
  },
});
