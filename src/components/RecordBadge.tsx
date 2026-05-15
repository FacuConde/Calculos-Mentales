import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';

export default function RecordBadge() {
  const { theme } = useSettings();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.2, friction: 4, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: theme.warning, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.text}>NUEVO RECORD</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: FONT_SIZES.sm,
    letterSpacing: 2,
  },
});
