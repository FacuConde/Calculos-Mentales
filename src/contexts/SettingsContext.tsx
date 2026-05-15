import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppSettings, Difficulty, GameMode } from '../types/types';
import { getSettings, saveSettings } from '../utils/storage';
import { DARK_THEME, LIGHT_THEME, Theme } from '../constants/theme';

interface SettingsState extends AppSettings {}

type SettingsAction =
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_LAST_MODE'; payload: GameMode }
  | { type: 'SET_LAST_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_SOUND'; payload: boolean }
  | { type: 'LOAD'; payload: AppSettings };

const defaults: SettingsState = {
  theme: 'dark',
  lastMode: GameMode.Clasico,
  lastDifficulty: Difficulty.Facil,
  soundEnabled: true,
};

function reducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'LOAD': return action.payload;
    case 'SET_THEME': return { ...state, theme: action.payload };
    case 'SET_LAST_MODE': return { ...state, lastMode: action.payload };
    case 'SET_LAST_DIFFICULTY': return { ...state, lastDifficulty: action.payload };
    case 'SET_SOUND': return { ...state, soundEnabled: action.payload };
    default: return state;
  }
}

interface SettingsContextValue {
  settings: SettingsState;
  theme: Theme;
  dispatch: React.Dispatch<SettingsAction>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, dispatch] = useReducer(reducer, defaults);

  useEffect(() => {
    getSettings().then(saved => {
      if (saved) dispatch({ type: 'LOAD', payload: saved });
    });
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const theme = settings.theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <SettingsContext.Provider value={{ settings, theme, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
