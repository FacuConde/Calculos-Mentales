import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { BestScores, GameRecord } from '../types/types';
import { getBestScores, getHistory } from '../utils/storage';

interface GameState {
  history: GameRecord[];
  bestScores: BestScores;
}

type GameAction =
  | { type: 'LOAD_HISTORY'; payload: GameRecord[] }
  | { type: 'LOAD_BEST_SCORES'; payload: BestScores }
  | { type: 'ADD_RECORD'; payload: GameRecord }
  | { type: 'UPDATE_BEST_SCORE'; payload: { key: string; score: number } }
  | { type: 'CLEAR_ALL' };

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_HISTORY':
      return { ...state, history: action.payload };
    case 'LOAD_BEST_SCORES':
      return { ...state, bestScores: action.payload };
    case 'ADD_RECORD':
      return { ...state, history: [action.payload, ...state.history].slice(0, 50) };
    case 'UPDATE_BEST_SCORE':
      return {
        ...state,
        bestScores: { ...state.bestScores, [action.payload.key]: action.payload.score },
      };
    case 'CLEAR_ALL':
      return { history: [], bestScores: {} };
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { history: [], bestScores: {} });

  useEffect(() => {
    Promise.all([getHistory(), getBestScores()]).then(([history, bestScores]) => {
      dispatch({ type: 'LOAD_HISTORY', payload: history });
      dispatch({ type: 'LOAD_BEST_SCORES', payload: bestScores });
    });
  }, []);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
