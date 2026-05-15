import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { FONT_SIZES, SPACING } from '../constants/theme';
import { GameMode, Operation } from '../types/types';

interface Props {
  operation: Operation;
  mode: GameMode;
  inputValue?: string;
}

export default function OperationDisplay({ operation, mode, inputValue = '?' }: Props) {
  const { theme } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [operation.id]);

  function renderExpression() {
    if (mode === GameMode.VerdaderoFalso) {
      return `${operation.expression} = ${operation.displayedAnswer}`;
    }
    return `${operation.expression} = ${inputValue}`;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={[styles.expression, { color: theme.textPrimary }]}>
        {renderExpression()}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  expression: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
  },
});
