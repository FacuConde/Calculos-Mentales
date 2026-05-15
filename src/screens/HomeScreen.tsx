import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch,
  Text, TouchableOpacity, View,
} from 'react-native';
import ConfirmModal from '../components/ConfirmModal';
import { useSettings } from '../contexts/SettingsContext';
import { useGame } from '../contexts/GameContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import { RootStackParamList } from '../types/types';
import { clearAll } from '../utils/storage';
import { soundManager } from '../utils/soundManager';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Module-level flag so intro plays only on first app launch, not on back-navigation
let introPlayed = false;

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { theme, settings, dispatch: settingsDispatch } = useSettings();
  const { dispatch: gameDispatch } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!introPlayed) {
      introPlayed = true;
      soundManager.play('intro', settings.soundEnabled);
    }
  }, []);

  async function handleClearAll() {
    await clearAll();
    gameDispatch({ type: 'CLEAR_ALL' });
    setShowConfirm(false);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.primary }]}>Cálculo{'\n'}Mental</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Entrenamiento matemático
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: theme.primary }]}
          onPress={() => { soundManager.play('click', settings.soundEnabled); nav.navigate('Config'); }}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnText}>Jugar</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => { soundManager.play('click', settings.soundEnabled); nav.navigate('History'); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => { soundManager.play('click', settings.soundEnabled); nav.navigate('Stats'); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Estadísticas</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.settingsLabel, { color: theme.textPrimary }]}>Tema oscuro</Text>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={v => settingsDispatch({ type: 'SET_THEME', payload: v ? 'dark' : 'light' })}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFF"
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowConfirm(true)}
          style={styles.dangerBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.dangerText, { color: theme.error }]}>Reiniciar progreso</Text>
        </TouchableOpacity>

      </ScrollView>

      <ConfirmModal
        visible={showConfirm}
        title="Reiniciar progreso"
        message="Se borrarán todas las partidas e historial. Esta acción no se puede deshacer."
        confirmLabel="Borrar todo"
        onConfirm={handleClearAll}
        onCancel={() => setShowConfirm(false)}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: SPACING.xl, gap: SPACING.lg },
  header: { alignItems: 'center', paddingTop: SPACING.xxl, paddingBottom: SPACING.lg },
  title: { fontSize: 56, fontWeight: '900', textAlign: 'center', lineHeight: 60 },
  subtitle: { fontSize: FONT_SIZES.md, marginTop: SPACING.sm },
  playBtn: {
    height: 72, borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnText: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  secondaryButtons: { flexDirection: 'row', gap: SPACING.md },
  secondaryBtn: {
    flex: 1, height: 56, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1,
  },
  settingsLabel: { fontSize: FONT_SIZES.md, fontWeight: '500' },
  dangerBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  dangerText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
});
