import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, BestScores, GameMode, Difficulty, GameRecord } from '../types/types';

const KEY_SETTINGS = '@settings';
const KEY_HISTORY = '@history';
const KEY_BEST_SCORES = '@bestScores';
const MAX_HISTORY = 50;

export function bestScoreKey(mode: GameMode, difficulty: Difficulty): string {
  return `${mode}_${difficulty}`;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export async function getSettings(): Promise<AppSettings | null> {
  const raw = await AsyncStorage.getItem(KEY_SETTINGS);
  return raw ? JSON.parse(raw) : null;
}

export async function saveGame(record: GameRecord): Promise<boolean> {
  const [rawHistory, rawBest] = await Promise.all([
    AsyncStorage.getItem(KEY_HISTORY),
    AsyncStorage.getItem(KEY_BEST_SCORES),
  ]);

  const history: GameRecord[] = rawHistory ? JSON.parse(rawHistory) : [];
  history.unshift(record);
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);

  const bestScores: BestScores = rawBest ? JSON.parse(rawBest) : {};
  const key = bestScoreKey(record.mode, record.difficulty);
  const isNewRecord = record.score > (bestScores[key] ?? -Infinity);
  if (isNewRecord) bestScores[key] = record.score;

  await Promise.all([
    AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(history)),
    AsyncStorage.setItem(KEY_BEST_SCORES, JSON.stringify(bestScores)),
  ]);

  return isNewRecord;
}

export async function getHistory(): Promise<GameRecord[]> {
  const raw = await AsyncStorage.getItem(KEY_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

export async function getBestScores(): Promise<BestScores> {
  const raw = await AsyncStorage.getItem(KEY_BEST_SCORES);
  return raw ? JSON.parse(raw) : {};
}

export async function clearAll(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(KEY_HISTORY),
    AsyncStorage.removeItem(KEY_BEST_SCORES),
  ]);
}
