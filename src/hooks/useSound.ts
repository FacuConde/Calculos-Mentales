import { useCallback } from 'react';
import { soundManager } from '../utils/soundManager';

type SoundKey = 'correct' | 'incorrect' | 'timeout' | 'finish';

export function useSound(enabled: boolean) {
  const play = useCallback((key: SoundKey) => {
    soundManager.play(key, enabled);
  }, [enabled]);

  return { play };
}
