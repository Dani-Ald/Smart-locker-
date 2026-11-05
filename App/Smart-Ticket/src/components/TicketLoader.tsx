import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/** Indicador animado de Smart Ticket para esperas breves. */
export function TicketLoader() {
  const [float] = useState(() => new Animated.Value(0));
  const [blink] = useState(() => new Animated.Value(1));
  const [pulse] = useState(() => new Animated.Value(0.45));

  useEffect(() => {
    const floatLoop = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const blinkLoop = Animated.loop(Animated.sequence([
      Animated.delay(1800),
      Animated.timing(blink, { toValue: 0.12, duration: 100, useNativeDriver: true }),
      Animated.delay(100),
      Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]));
    const pulseLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.9, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.45, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    floatLoop.start();
    blinkLoop.start();
    pulseLoop.start();
    return () => {
      floatLoop.stop();
      blinkLoop.stop();
      pulseLoop.stop();
    };
  }, [blink, float, pulse]);

  const bob = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  return (
    <View accessible accessibilityLabel="Cargando" accessibilityRole="progressbar" style={styles.container}>
      <Animated.View style={[styles.glow, { opacity: pulse }]} />
      <Animated.View style={[styles.head, { transform: [{ translateY: bob }] }]} />
      <Animated.View style={[styles.particle, styles.particleOne, { transform: [{ translateY: bob }] }]} />
      <Animated.View style={[styles.particle, styles.particleTwo, { transform: [{ translateY: Animated.multiply(bob, 0.55) }] }]} />
      <Animated.View style={[styles.particle, styles.particleThree, { transform: [{ translateY: Animated.multiply(bob, 0.8) }] }]} />
      <Animated.View style={[styles.eye, { transform: [{ translateY: bob }] }]}>
        <Animated.View style={[styles.pupil, { opacity: blink }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: '#72EBC3' },
  head: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#E5F295', shadowColor: '#5BEEBD', shadowOpacity: 0.75, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 9 },
  eye: { position: 'absolute', width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFFFC8', shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 },
  pupil: { width: 9, height: 22, borderRadius: 6, backgroundColor: '#09111F' },
  particle: { position: 'absolute', borderRadius: 99, backgroundColor: '#E5F295', shadowColor: '#5BEEBD', shadowOpacity: 0.65, shadowRadius: 8, elevation: 3 },
  particleOne: { width: 16, height: 16, top: 7, left: 15 },
  particleTwo: { width: 10, height: 10, top: 19, right: 10 },
  particleThree: { width: 7, height: 7, top: 0, right: 32 },
});
