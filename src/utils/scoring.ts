import { OperationResult } from '../types/types';
import { DIFFICULTY_PARAMS } from '../constants/difficulty';
import { Difficulty } from '../types/types';

const POINTS_FAST = 100;
const POINTS_IN_TIME = 70;
const POINTS_INCORRECT = -30;
const POINTS_TIMEOUT = -50;

const FAST_THRESHOLD = 0.75;

export function calculatePoints(
  isCorrect: boolean,
  isTimeout: boolean,
  responseTime: number,
  maxSeconds: number
): number {
  if (isTimeout) return POINTS_TIMEOUT;
  if (!isCorrect) return POINTS_INCORRECT;

  const ratio = responseTime / (maxSeconds * 1000);
  return ratio < FAST_THRESHOLD ? POINTS_FAST : POINTS_IN_TIME;
}

export function evaluateAnswer(
  userAnswer: number | null,
  correctAnswer: number,
  responseTime: number,
  maxSeconds: number,
  isTimeout: boolean
): Pick<OperationResult, 'isCorrect' | 'points'> {
  if (isTimeout) {
    return { isCorrect: false, points: POINTS_TIMEOUT };
  }
  const isCorrect = userAnswer === correctAnswer;
  const points = calculatePoints(isCorrect, false, responseTime, maxSeconds);
  return { isCorrect, points };
}

export function computeFinalScore(results: OperationResult[]): number {
  return results.reduce((sum, r) => sum + r.points, 0);
}

export function computeAccuracy(results: OperationResult[]): number {
  if (results.length === 0) return 0;
  const correct = results.filter(r => r.isCorrect).length;
  return Math.round((correct / results.length) * 100);
}

export function computeAvgResponseTime(results: OperationResult[]): number {
  const answered = results.filter(r => !r.isTimeout);
  if (answered.length === 0) return 0;
  const total = answered.reduce((sum, r) => sum + r.responseTime, 0);
  return Math.round(total / answered.length);
}

export function getMaxSeconds(difficulty: Difficulty): number {
  return DIFFICULTY_PARAMS[difficulty].maxSeconds;
}
