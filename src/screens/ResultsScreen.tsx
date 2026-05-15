import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import AnimatedScore from '../components/AnimatedScore';
import GameCard from '../components/GameCard';
import RecordBadge from '../components/RecordBadge';
import { useSettings } from '../contexts/SettingsContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import { RootStackParamList } from '../types/types';
import { soundManager } from '../utils/soundManager';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Results'>;
type Route = RouteProp<RootStackParamList, 'Results'>;

export default function ResultsScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { record, isNewRecord } = route.params;
  const { theme, settings } = useSettings();

  useEffect(() => {
    if (record.score < 0) {
      soundManager.play('lose', settings.soundEnabled);
    }
  }, []);

  const stats = [
    { label: 'Correctas', value: record.correct, color: theme.success },
    { label: 'Incorrectas', value: record.incorrect, color: theme.error },
    { label: 'Timeouts', value: record.timeouts, color: theme.warning },
    { label: 'Precisión', value: `${record.accuracy}%`, color: theme.primary },
    { label: 'T. promedio', value: `${(record.avgResponseTime / 1000).toFixed(1)}s`, color: theme.textSecondary },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Resultado</Text>

        {isNewRecord && <RecordBadge />}

        <View style={styles.scoreContainer}>
          <AnimatedScore targetScore={record.score} />
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>puntos</Text>
        </View>

        <GameCard>
          <View style={styles.statsGrid}>
            {stats.map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </GameCard>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary }]}
            onPress={() => {
              soundManager.play('click', settings.soundEnabled);
              nav.replace('Game', {
                config: {
                  difficulty: record.difficulty,
                  mode: record.mode,
                  iterations: record.iterations,
                  duration: record.iterations,
                  stopOnError: false,
                  soundEnabled: settings.soundEnabled,
                }
              });
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.btnTextWhite}>Jugar de nuevo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => { soundManager.play('click', settings.soundEnabled); nav.navigate('Config'); }}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, { color: theme.textPrimary }]}>Cambiar config</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.halfBtn, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => { soundManager.play('click', settings.soundEnabled); nav.navigate('History'); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.btnText, { color: theme.textPrimary }]}>Historial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.halfBtn, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => { soundManager.play('click', settings.soundEnabled); nav.navigate('Home'); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.btnText, { color: theme.textPrimary }]}>Inicio</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: SPACING.xl, gap: SPACING.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', textAlign: 'center' },
  scoreContainer: { alignItems: 'center', gap: SPACING.xs },
  scoreLabel: { fontSize: FONT_SIZES.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  statItem: { width: '45%', alignItems: 'center', gap: 2 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
  statLabel: { fontSize: FONT_SIZES.xs },
  buttons: { gap: SPACING.sm },
  btn: {
    height: 56, borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  halfBtn: {
    flex: 1, height: 56, borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
  btnTextWhite: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#FFF' },
  btnText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
});
