import { Difficulty, Operator } from '../types/types';

export interface DifficultyParams {
  operators: Operator[];
  operandRange: [number, number];
  multiplyRange: [number, number];
  maxSeconds: number;
}

export const DIFFICULTY_PARAMS: Record<Difficulty, DifficultyParams> = {
  [Difficulty.Facil]: {
    operators: ['+', '-'],
    operandRange: [1, 20],
    multiplyRange: [1, 20],
    maxSeconds: 10,
  },
  [Difficulty.Medio]: {
    operators: ['+', '-', '*'],
    operandRange: [1, 50],
    multiplyRange: [1, 12],
    maxSeconds: 8,
  },
  [Difficulty.Dificil]: {
    operators: ['+', '-', '*', '/'],
    operandRange: [1, 100],
    multiplyRange: [1, 12],
    maxSeconds: 6,
  },
};

export const ITERATION_OPTIONS = [5, 10, 15, 20];
export const DURATION_OPTIONS = [30, 60, 120];
export const DEFAULT_ITERATIONS = 10;
export const DEFAULT_DURATION = 60;
