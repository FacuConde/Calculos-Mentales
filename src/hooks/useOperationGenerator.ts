import { useRef } from 'react';
import { Difficulty, GameMode, Operation } from '../types/types';
import { generateOperation } from '../utils/operations';

export function useOperationGenerator(difficulty: Difficulty, mode: GameMode) {
  const lastIdRef = useRef<string | undefined>(undefined);

  function next(): Operation {
    const op = generateOperation(difficulty, mode, lastIdRef.current);
    lastIdRef.current = op.id;
    return op;
  }

  return { next };
}
