import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { BORDER_RADIUS, SPACING } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GameCard({ children, style }: Props) {
  const { theme } = useSettings();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
});
