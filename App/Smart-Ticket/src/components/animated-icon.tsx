import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 800;
const APP_ICON = require('@/assets/images/BOT-icon.png');

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
    },
    65: {
      opacity: 1,
    },
    100: {
      opacity: 0,
      easing: Easing.out(Easing.quad),
    },
  });

  const iconKeyframe = new Keyframe({
    0: {
      opacity: 0.7,
      transform: [{ scale: 0.82 }],
    },
    45: {
      opacity: 1,
      transform: [{ scale: 1.06 }],
      easing: Easing.out(Easing.cubic),
    },
    72: {
      opacity: 1,
      transform: [{ scale: 1 }],
      easing: Easing.inOut(Easing.quad),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1.03 }],
    },
  });

  const staticImage = <Image contentFit="contain" style={styles.splashImage} source={APP_ICON} />;

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      <Animated.View entering={iconKeyframe.duration(DURATION)} style={styles.splashIconContainer}>
        <Image contentFit="contain" style={styles.splashImage} source={APP_ICON} />
      </Animated.View>
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {staticImage}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image contentFit="contain" style={styles.image} source={APP_ICON} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: 24,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  splashIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: 170,
    height: 170,
    borderRadius: 42,
  },
});
