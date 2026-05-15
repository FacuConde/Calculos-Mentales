export enum Difficulty {
  Facil = 'facil',
  Medio = 'medio',
  Dificil = 'dificil',
}

export enum GameMode {
  Clasico = 'clasico',
  VerdaderoFalso = 'verdaderoFalso',
  MultipleChoice = 'multipleChoice',
  ContraReloj = 'contraReloj',
}

export type Operator = '+' | '-' | '*' | '/';

export interface Operation {
  id: string;
  expression: string;
  operands: [number, number];
  operator: Operator;
  correctAnswer: number;
  options?: number[];
  displayedAnswer?: number;
  isDisplayedCorrect?: boolean;
}

export interface GameConfig {
  difficulty: Difficulty;
  mode: GameMode;
  iterations: number;
  duration: number;
  stopOnError: boolean;
  soundEnabled: boolean;
}

export interface OperationResult {
  operationId: string;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  isTimeout: boolean;
  responseTime: number;
  points: number;
}

export interface GameRecord {
  id: string;
  date: string;
  mode: GameMode;
  difficulty: Difficulty;
  iterations: number;
  score: number;
  correct: number;
  incorrect: number;
  timeouts: number;
  avgResponseTime: number;
  accuracy: number;
}

export interface BestScores {
  [key: string]: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  lastMode: GameMode;
  lastDifficulty: Difficulty;
  soundEnabled: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  Config: undefined;
  Game: { config: GameConfig };
  Results: { record: GameRecord; isNewRecord: boolean };
  History: undefined;
  Stats: undefined;
};
