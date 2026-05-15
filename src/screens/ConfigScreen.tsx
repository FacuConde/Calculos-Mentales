import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import {
  DEFAULT_DURATION, DEFAULT_ITERATIONS,
  DURATION_OPTIONS, ITERATION_OPTIONS,
} from '../constants/difficulty';
import { Difficulty, GameConfig, GameMode, RootStackParamList } from '../types/types';
import { soundManager } from '../utils/soundManager';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Config'>;

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.Facil]: 'Fácil',
  [Difficulty.Medio]: 'Medio',
  [Difficulty.Dificil]: 'Difícil',
};

const MODE_LABELS: Record<GameMode, string> = {
  [GameMode.Clasico]: 'Clásico',
  [GameMode.VerdaderoFalso]: 'Verdadero / Falso',
  [GameMode.MultipleChoice]: 'Múltiple Choice',
  [GameMode.ContraReloj]: 'Contra Reloj',
};

export default function ConfigScreen() {
  const nav = useNavigation<Nav>();
  const { theme, settings, dispatch } = useSettings();

  const [difficulty, setDifficulty] = useState<Difficulty>(settings.lastDifficulty);
  const [mode, setMode] = useState<GameMode>(settings.lastMode);
  const [iterations, setIterations] = useState(DEFAULT_ITERATIONS);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [stopOnError, setStopOnError] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  const isContraReloj = mode === GameMode.ContraReloj;

  function handleStart() {
    dispatch({ type: 'SET_LAST_MODE', payload: mode });
    dispatch({ type: 'SET_LAST_DIFFICULTY', payload: difficulty });
    dispatch({ type: 'SET_SOUND', payload: soundEnabled });

    const config: GameConfig = {
      difficulty, mode, iterations, duration, stopOnError, soundEnabled,
    };
    nav.navigate('Game', { config });
  }

  function renderChips<T extends string>(
    options: T[],
    selected: T,
    onSelect: (v: T) => void,
    labels: Record<T, string>
  ) {
    return (
      <View style={styles.chips}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => { soundManager.play('click', true); onSelect(opt); }}
            style={[
              styles.chip,
              {
                backgroundColor: selected === opt ? theme.primary : theme.surface,
                borderColor: selected === opt ? theme.primary : theme.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.chipText,
              { color: selected === opt ? '#FFF' : theme.textSecondary },
            ]}>
              {labels[opt]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.primary }]}>← Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Configurar partida</Text>
        </View>

        <Section label="Dificultad" theme={theme}>
          {renderChips(
            Object.values(Difficulty),
            difficulty,
            setDifficulty,
            DIFFICULTY_LABELS
          )}
        </Section>

        <Section label="Modo de juego" theme={theme}>
          {renderChips(Object.values(GameMode), mode, setMode, MODE_LABELS)}
        </Section>

        <Section label={isContraReloj ? 'Duración total' : 'Operaciones por ronda'} theme={theme}>
          {isContraReloj
            ? renderChips(
                DURATION_OPTIONS.map(String),
                String(duration),
                (v: string) => setDuration(Number(v)),
                Object.fromEntries(DURATION_OPTIONS.map(d => [String(d), `${d}s`])) as Record<string, string>
              )
            : renderChips(
                ITERATION_OPTIONS.map(String),
                String(iterations),
                (v: string) => setIterations(Number(v)),
                Object.fromEntries(ITERATION_OPTIONS.map(i => [String(i), String(i)])) as Record<string, string>
              )
          }
        </Section>

        {isContraReloj && (
          <Section label="Opciones" theme={theme}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
                Terminar al primer error
              </Text>
              <Switch
                value={stopOnError}
                onValueChange={setStopOnError}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFF"
              />
            </View>
          </Section>
        )}

        <Section label="Sonido" theme={theme}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Efectos de sonido</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFF"
            />
          </View>
        </Section>

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: theme.primary }]}
          onPress={() => { soundManager.play('click', true); handleStart(); }}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Comenzar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  label, children, theme,
}: {
  label: string;
  children: React.ReactNode;
  theme: any;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: SPACING.xl, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  titleRow: { gap: SPACING.xs },
  backBtn: { alignSelf: 'flex-start' },
  backText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  section: { gap: SPACING.sm },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1,
  },
  chipText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  switchLabel: { fontSize: FONT_SIZES.md },
  startBtn: {
    height: 64, borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md,
  },
  startBtnText: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
});
