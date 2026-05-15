import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import NumericKeyboard from '../components/NumericKeyboard';
import OperationDisplay from '../components/OperationDisplay';
import TimerBar from '../components/TimerBar';
import { useSettings } from '../contexts/SettingsContext';
import { useGame } from '../contexts/GameContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSound } from '../hooks/useSound';
import { GameMode, OperationResult, GameRecord, RootStackParamList } from '../types/types';
import { computeAccuracy, computeAvgResponseTime, computeFinalScore } from '../utils/scoring';
import { bestScoreKey, saveGame } from '../utils/storage';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;
type Route = RouteProp<RootStackParamList, 'Game'>;

export default function GameScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { config } = route.params;
  const { theme, settings } = useSettings();
  const { state: gameState, dispatch } = useGame();

  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const { play } = useSound(config.soundEnabled);

  const handleFinish = useCallback(async (results: OperationResult[]) => {
    const score = computeFinalScore(results);
    const correct = results.filter(r => r.isCorrect).length;
    const incorrect = results.filter(r => !r.isCorrect && !r.isTimeout).length;
    const timeouts = results.filter(r => r.isTimeout).length;
    const avgResponseTime = computeAvgResponseTime(results);
    const accuracy = computeAccuracy(results);

    const record: GameRecord = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      mode: config.mode,
      difficulty: config.difficulty,
      iterations: config.mode === GameMode.ContraReloj ? config.duration : results.length,
      score,
      correct,
      incorrect,
      timeouts,
      avgResponseTime,
      accuracy,
    };

    const isNewRecord = await saveGame(record);
    dispatch({ type: 'ADD_RECORD', payload: record });

    const key = bestScoreKey(config.mode, config.difficulty);
    if (isNewRecord) {
      dispatch({ type: 'UPDATE_BEST_SCORE', payload: { key, score } });
    }

    play('finish');
    nav.replace('Results', { record, isNewRecord });
  }, [config, nav, dispatch, play]);

  const { phase, currentOperation, currentIndex, totalIterations,
    results, timer, globalProgress, elapsedGlobal, startGame, submitAnswer } =
    useGameLogic(config, handleFinish, () => play('timeout'));

  useEffect(() => {
    startGame();
  }, []);

  function handleSubmit() {
    if (!inputValue || inputValue === '-' || !currentOperation) return;
    const answer = parseInt(inputValue, 10);
    const isCorrect = answer === currentOperation.correctAnswer;
    play(isCorrect ? 'correct' : 'incorrect');
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => {
      setFeedback(null);
      setInputValue('');
    }, 300);
    submitAnswer(answer);
  }

  function handleVF(answer: boolean) {
    if (!currentOperation) return;
    const isCorrectAnswer = answer === currentOperation.isDisplayedCorrect;
    play(isCorrectAnswer ? 'correct' : 'incorrect');
    setFeedback(isCorrectAnswer ? 'correct' : 'incorrect');
    setTimeout(() => setFeedback(null), 300);
    submitAnswer(isCorrectAnswer ? currentOperation.correctAnswer : currentOperation.correctAnswer + 1);
  }

  function handleMC(option: number) {
    const isCorrect = option === currentOperation?.correctAnswer;
    play(isCorrect ? 'correct' : 'incorrect');
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => setFeedback(null), 300);
    submitAnswer(option);
  }

  const isContraReloj = config.mode === GameMode.ContraReloj;
  const remainingGlobal = isContraReloj
    ? Math.max(0, config.duration - Math.floor(elapsedGlobal / 1000))
    : null;

  const feedbackBg =
    feedback === 'correct' ? theme.success :
    feedback === 'incorrect' ? theme.error :
    'transparent';

  if (phase === 'idle' || !currentOperation) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.container, { borderColor: feedbackBg, borderWidth: feedback ? 3 : 0 }]}>

        {/* Header */}
        <View style={styles.header}>
          {isContraReloj ? (
            <Text style={[styles.counter, { color: theme.textSecondary }]}>
              Tiempo: {remainingGlobal}s
            </Text>
          ) : (
            <Text style={[styles.counter, { color: theme.textSecondary }]}>
              {currentIndex} / {totalIterations}
            </Text>
          )}
          <Text style={[styles.score, { color: theme.primary }]}>
            {computeFinalScore(results)} pts
          </Text>
        </View>

        {/* Timer bar */}
        <TimerBar progress={timer.progress} color={timer.color} />

        {/* Operation */}
        <OperationDisplay
          operation={currentOperation}
          mode={config.mode}
          inputValue={inputValue || '?'}
        />

        {/* Answer UI */}
        {config.mode === GameMode.Clasico || config.mode === GameMode.ContraReloj ? (
          <NumericKeyboard
            value={inputValue}
            onChange={setInputValue}
            onConfirm={handleSubmit}
          />
        ) : config.mode === GameMode.VerdaderoFalso ? (
          <View style={styles.vfRow}>
            <TouchableOpacity
              style={[styles.vfBtn, { backgroundColor: theme.success }]}
              onPress={() => handleVF(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.vfText}>Verdadero</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.vfBtn, { backgroundColor: theme.error }]}
              onPress={() => handleVF(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.vfText}>Falso</Text>
            </TouchableOpacity>
          </View>
        ) : config.mode === GameMode.MultipleChoice ? (
          <View style={styles.mcGrid}>
            {(currentOperation.options ?? []).map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.mcBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleMC(opt)}
                activeOpacity={0.8}
              >
                <Text style={[styles.mcText, { color: theme.textPrimary }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: SPACING.lg, gap: SPACING.md, borderRadius: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  score: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FONT_SIZES.lg },
  vfRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  vfBtn: {
    flex: 1, height: 72, borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  vfText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#FFF' },
  mcGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginTop: SPACING.md },
  mcBtn: {
    width: '47%', height: 72, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  mcText: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
});
