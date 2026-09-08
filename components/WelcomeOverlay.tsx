import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export function WelcomeOverlay({ onComplete }: { onComplete: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const player = useAudioPlayer(require('../assets/audio/welcome.wav'));
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.84)).current;
  const glow = useRef(new Animated.Value(0.2)).current;
  const isLandscape = width > height;

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    player.volume = 0.62;
    player.play();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 430,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 14,
        stiffness: 130,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 0.62, duration: 720, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.2, duration: 720, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        { iterations: 2 },
      ),
    ]).start();

    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 360,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onComplete();
      });
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      player.pause();
    };
  }, [glow, onComplete, opacity, player, scale]);

  return (
    <Animated.View
      style={[
        styles.overlay,
        { backgroundColor: colors.background, opacity },
        isLandscape && styles.landscapeOverlay,
      ]}
    >
      <Animated.View style={[styles.redGlow, { backgroundColor: colors.primary, opacity: glow }]} />
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <View style={[styles.logoFrame, { borderColor: colors.primary }]}>
          <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>STREAMORA</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>رفاهية المشاهدة</Text>
        <View style={styles.loadingRow}>
          <View style={[styles.loadingTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.loadingFill, { backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>جاري التحضير</Text>
        </View>
      </Animated.View>
      <Text style={[styles.footer, { color: colors.mutedForeground, bottom: Math.max(insets.bottom, 18) }]}>YOUR WORLD. ONE STREAM.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeOverlay: {
    flexDirection: 'row',
    gap: 52,
  },
  redGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.25,
  },
  content: {
    alignItems: 'center',
  },
  logoFrame: {
    width: 94,
    height: 94,
    borderRadius: 30,
    borderWidth: 1,
    padding: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: 2.1,
    marginTop: 18,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 6,
  },
  loadingRow: {
    alignItems: 'center',
    marginTop: 39,
  },
  loadingTrack: {
    width: 112,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    width: '62%',
    height: 3,
    borderRadius: 2,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    marginTop: 9,
  },
  footer: {
    position: 'absolute',
    fontFamily: 'Inter_500Medium',
    fontSize: 8,
    letterSpacing: 1.1,
  },
});