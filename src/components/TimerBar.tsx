import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

interface Props {
  progress: number;
  color: 'green' | 'yellow' | 'red';
}

export default function TimerBar({ progress, color }: Props) {
  const { theme } = useSettings();
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const barColor =
    color === 'green'
      ? theme.timerGreen
      : color === 'yellow'
      ? theme.timerYellow
      : theme.timerRed;

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.track, { backgroundColor: theme.border }]}>
      <Animated.View style={[styles.bar, { width, backgroundColor: barColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});
