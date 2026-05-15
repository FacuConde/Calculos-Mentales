import { useCallback, useRef, useState } from 'react';
import { GameConfig, GameMode, Operation, OperationResult } from '../types/types';
import { evaluateAnswer, getMaxSeconds } from '../utils/scoring';
import { useOperationGenerator } from './useOperationGenerator';
import { useTimer } from './useTimer';

export type GamePhase = 'idle' | 'playing' | 'finished';

interface GameLogicState {
  phase: GamePhase;
  currentOperation: Operation | null;
  currentIndex: number;
  results: OperationResult[];
  elapsedGlobal: number;
}

export function useGameLogic(
  config: GameConfig,
  onFinish: (results: OperationResult[]) => void,
  onTimeoutSound?: () => void
) {
  const { next } = useOperationGenerator(config.difficulty, config.mode);
  const maxSeconds = getMaxSeconds(config.difficulty);

  const [state, setState] = useState<GameLogicState>({
    phase: 'idle',
    currentOperation: null,
    currentIndex: 0,
    results: [],
    elapsedGlobal: 0,
  });

  const resultsRef = useRef<OperationResult[]>([]);
  const opStartTimeRef = useRef<number>(0);
  const globalStartRef = useRef<number>(0);
  const globalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const finishGame = useCallback((finalResults: OperationResult[]) => {
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    setState(prev => ({ ...prev, phase: 'finished' }));
    onFinish(finalResults);
  }, [onFinish]);

  const advanceOrFinish = useCallback((updatedResults: OperationResult[]) => {
    const cfg = configRef.current;
    const isContraReloj = cfg.mode === GameMode.ContraReloj;

    if (!isContraReloj) {
      if (updatedResults.length >= cfg.iterations) {
        finishGame(updatedResults);
        return;
      }
    } else {
      const elapsed = Date.now() - globalStartRef.current;
      if (elapsed >= cfg.duration * 1000) {
        finishGame(updatedResults);
        return;
      }
      const lastResult = updatedResults[updatedResults.length - 1];
      if (cfg.stopOnError && lastResult && !lastResult.isCorrect) {
        finishGame(updatedResults);
        return;
      }
    }

    const nextOp = next();
    opStartTimeRef.current = Date.now();
    setState(prev => ({
      ...prev,
      currentOperation: nextOp,
      currentIndex: prev.currentIndex + 1,
    }));
  }, [next, finishGame]);

  const handleTimeout = useCallback(() => {
    const op = state.currentOperation;
    if (!op) return;

    const result: OperationResult = {
      operationId: op.id,
      userAnswer: null,
      correctAnswer: op.correctAnswer,
      isCorrect: false,
      isTimeout: true,
      responseTime: maxSeconds * 1000,
      points: -50,
    };

    const updated = [...resultsRef.current, result];
    resultsRef.current = updated;
    setState(prev => ({ ...prev, results: updated }));
    onTimeoutSound?.();
    advanceOrFinish(updated);
  }, [state.currentOperation, maxSeconds, advanceOrFinish, onTimeoutSound]);

  const timer = useTimer(maxSeconds, handleTimeout);

  const startGame = useCallback(() => {
    resultsRef.current = [];
    globalStartRef.current = Date.now();

    const firstOp = next();
    opStartTimeRef.current = Date.now();

    if (config.mode === GameMode.ContraReloj) {
      globalTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - globalStartRef.current;
        setState(prev => ({ ...prev, elapsedGlobal: elapsed }));
        if (elapsed >= configRef.current.duration * 1000) {
          finishGame(resultsRef.current);
        }
      }, 500);
    }

    setState({
      phase: 'playing',
      currentOperation: firstOp,
      currentIndex: 1,
      results: [],
      elapsedGlobal: 0,
    });

    timer.start();
  }, [next, config.mode, finishGame, timer]);

  const submitAnswer = useCallback((userAnswer: number) => {
    const op = state.currentOperation;
    if (!op || state.phase !== 'playing') return;

    const responseTime = Date.now() - opStartTimeRef.current;
    const { isCorrect, points } = evaluateAnswer(
      userAnswer,
      op.correctAnswer,
      responseTime,
      maxSeconds,
      false
    );

    const result: OperationResult = {
      operationId: op.id,
      userAnswer,
      correctAnswer: op.correctAnswer,
      isCorrect,
      isTimeout: false,
      responseTime,
      points,
    };

    const updated = [...resultsRef.current, result];
    resultsRef.current = updated;
    setState(prev => ({ ...prev, results: updated }));
    timer.stop();
    advanceOrFinish(updated);

    // Restart timer for next op (advanceOrFinish sets new op synchronously)
    setTimeout(() => timer.start(), 50);
  }, [state, maxSeconds, timer, advanceOrFinish]);

  const totalIterations =
    config.mode === GameMode.ContraReloj ? null : config.iterations;

  const globalProgress =
    config.mode === GameMode.ContraReloj
      ? Math.min(state.elapsedGlobal / (config.duration * 1000), 1)
      : state.currentIndex / (config.iterations || 1);

  return {
    phase: state.phase,
    currentOperation: state.currentOperation,
    currentIndex: state.currentIndex,
    totalIterations,
    results: state.results,
    timer,
    globalProgress,
    elapsedGlobal: state.elapsedGlobal,
    startGame,
    submitAnswer,
  };
}
