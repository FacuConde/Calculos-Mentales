import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import GameCard from '../components/GameCard';
import { useSettings } from '../contexts/SettingsContext';
import { useGame } from '../contexts/GameContext';
import { FONT_SIZES, SPACING } from '../constants/theme';
import { Difficulty, GameMode } from '../types/types';
import { bestScoreKey } from '../utils/storage';

const MODE_LABELS: Record<GameMode, string> = {
  [GameMode.Clasico]: 'Clásico',
  [GameMode.VerdaderoFalso]: 'Verdadero/Falso',
  [GameMode.MultipleChoice]: 'Múltiple Choice',
  [GameMode.ContraReloj]: 'Contra Reloj',
};

const DIFF_LABELS: Record<Difficulty, string> = {
  [Difficulty.Facil]: 'Fácil',
  [Difficulty.Medio]: 'Medio',
  [Difficulty.Dificil]: 'Difícil',
};

export default function StatsScreen() {
  const nav = useNavigation();
  const { theme, settings } = useSettings();
  const { state } = useGame();
  const { history, bestScores } = state;

  const totalGames = history.length;
  const avgAccuracy = totalGames > 0
    ? Math.round(history.reduce((s, r) => s + r.accuracy, 0) / totalGames)
    : 0;
  const globalBest = totalGames > 0
    ? Math.max(...history.map(r => r.score))
    : 0;

  const modeStats = Object.values(GameMode).map(mode => {
    const games = history.filter(r => r.mode === mode);
    return {
      mode,
      count: games.length,
      best: games.length > 0 ? Math.max(...games.map(r => r.score)) : null,
      avgAccuracy: games.length > 0
        ? Math.round(games.reduce((s, r) => s + r.accuracy, 0) / games.length)
        : null,
    };
  }).filter(m => m.count > 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={[styles.back, { color: theme.primary }]}>← Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Estadísticas</Text>
        </View>

        <GameCard>
          <View style={styles.overviewGrid}>
            <StatItem label="Partidas" value={String(totalGames)} color={theme.primary} theme={theme} />
            <StatItem label="Mejor puntaje" value={totalGames > 0 ? `+${globalBest}` : '—'} color={theme.success} theme={theme} />
            <StatItem label="Precisión media" value={totalGames > 0 ? `${avgAccuracy}%` : '—'} color={theme.warning} theme={theme} />
          </View>
        </GameCard>

        {modeStats.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>POR MODO</Text>
            {modeStats.map(m => (
              <GameCard key={m.mode} style={{ gap: SPACING.sm }}>
                <Text style={[styles.modeName, { color: theme.textPrimary }]}>{MODE_LABELS[m.mode]}</Text>
                <View style={styles.modeRow}>
                  <Text style={[styles.modeStat, { color: theme.textSecondary }]}>{m.count} partidas</Text>
                  {m.best !== null && (
                    <Text style={[styles.modeStat, { color: theme.success }]}>Mejor: {m.best >= 0 ? '+' : ''}{m.best}</Text>
                  )}
                  {m.avgAccuracy !== null && (
                    <Text style={[styles.modeStat, { color: theme.primary }]}>Precisión: {m.avgAccuracy}%</Text>
                  )}
                </View>
              </GameCard>
            ))}
          </>
        )}

        {Object.keys(bestScores).length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>RÉCORDS</Text>
            <GameCard>
              {Object.entries(bestScores).map(([key, score]) => {
                const [mode, diff] = key.split('_') as [GameMode, Difficulty];
                return (
                  <View key={key} style={styles.recordRow}>
                    <Text style={[styles.recordKey, { color: theme.textSecondary }]}>
                      {MODE_LABELS[mode]} · {DIFF_LABELS[diff]}
                    </Text>
                    <Text style={[styles.recordScore, { color: theme.success }]}>
                      {score >= 0 ? '+' : ''}{score}
                    </Text>
                  </View>
                );
              })}
            </GameCard>
          </>
        )}

        {totalGames === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Jugá una partida para ver estadísticas</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, color, theme }: { label: string; value: string; color: string; theme: any }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: SPACING.xl, gap: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  back: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1.5 },
  overviewGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZES.xs },
  modeName: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  modeRow: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  modeStat: { fontSize: FONT_SIZES.sm },
  recordRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  recordKey: { fontSize: FONT_SIZES.sm },
  recordScore: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZES.md, textAlign: 'center' },
});
