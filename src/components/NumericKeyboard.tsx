import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import { soundManager } from '../utils/soundManager';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  allowNegative?: boolean;
}

const ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['−', '0', '⌫'],
];

export default function NumericKeyboard({ value, onChange, onConfirm, allowNegative = true }: Props) {
  const { theme } = useSettings();

  function handlePress(key: string) {
    soundManager.play('click', true);
    if (key === '⌫') {
      onChange(value.length <= 1 ? '' : value.slice(0, -1));
      return;
    }
    if (key === '−') {
      if (!allowNegative) return;
      if (value.startsWith('-')) {
        onChange(value.slice(1));
      } else {
        onChange('-' + value);
      }
      return;
    }
    if (value === '0') {
      onChange(key);
      return;
    }
    if (value === '-0') {
      onChange('-' + key);
      return;
    }
    if (value.replace('-', '').length >= 6) return;
    onChange(value + key);
  }

  return (
    <View style={styles.container}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(key => {
            const isAction = key === '⌫' || key === '−';
            const disabled = key === '−' && !allowNegative;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handlePress(key)}
                disabled={disabled}
                style={[
                  styles.key,
                  {
                    backgroundColor: isAction ? theme.surfaceElevated : theme.surface,
                    borderColor: theme.border,
                    opacity: disabled ? 0.3 : 1,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, { color: theme.textPrimary }]}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <TouchableOpacity
        onPress={onConfirm}
        disabled={value === '' || value === '-'}
        style={[
          styles.confirmBtn,
          {
            backgroundColor: theme.primary,
            opacity: value === '' || value === '-' ? 0.5 : 1,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.sm },
  key: {
    flex: 1,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: FONT_SIZES.xl, fontWeight: '600' },
  confirmBtn: {
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  confirmText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#FFF' },
});
