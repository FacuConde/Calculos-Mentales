import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer(maxSeconds: number, onTimeout: () => void) {
  const [remaining, setRemaining] = useState(maxSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const clear = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    setRemaining(maxSeconds);
    setIsRunning(true);
  }, [maxSeconds]);

  const stop = useCallback(() => {
    clear();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    clear();
    setRemaining(maxSeconds);
    setIsRunning(false);
  }, [maxSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    clear();
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          onTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning]);

  // Progress: 1.0 = full, 0.0 = empty
  const progress = maxSeconds > 0 ? remaining / maxSeconds : 0;

  // Color thresholds
  type TimerColor = 'green' | 'yellow' | 'red';
  const color: TimerColor = progress > 0.5 ? 'green' : progress > 0.25 ? 'yellow' : 'red';

  return { remaining, progress, color, start, stop, reset };
}
