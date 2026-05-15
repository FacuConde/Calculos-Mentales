import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmModal({
  visible, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  onConfirm, onCancel, destructive = false,
}: Props) {
  const { theme } = useSettings();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.btn, { backgroundColor: theme.surfaceElevated }]}
            >
              <Text style={[styles.btnText, { color: theme.textSecondary }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.btn, { backgroundColor: destructive ? theme.error : theme.primary }]}
            >
              <Text style={[styles.btnText, { color: '#FFF' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: SPACING.xl,
  },
  box: {
    width: '100%', borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, padding: SPACING.xl, gap: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  message: { fontSize: FONT_SIZES.md, lineHeight: 22 },
  buttons: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  btn: {
    flex: 1, height: 50, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
});
