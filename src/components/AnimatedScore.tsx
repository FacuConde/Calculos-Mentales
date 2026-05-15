import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { FONT_SIZES } from '../constants/theme';

interface Props {
  targetScore: number;
  duration?: number;
}

export default function AnimatedScore({ targetScore, duration = 1200 }: Props) {
  const { theme } = useSettings();
  const [displayed, setDisplayed] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const steps = 40;
    const stepTime = duration / steps;
    const increment = targetScore / steps;
    let current = 0;
    let count = 0;

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      count++;
      current += increment;
      if (count >= steps) {
        setDisplayed(targetScore);
        clearInterval(interval);
      } else {
        setDisplayed(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [targetScore]);

  const color = displayed >= 0 ? theme.success : theme.error;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text style={[styles.score, { color }]}>
        {displayed >= 0 ? '+' : ''}{displayed}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  score: {
    fontSize: FONT_SIZES.display,
    fontWeight: '900',
    textAlign: 'center',
  },
});
