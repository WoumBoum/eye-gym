import { useState, useRef, useCallback, useEffect } from 'react';

interface UseGameTimerOptions {
  duration: number; // seconds
  onComplete: () => void;
}

export function useGameTimer({ duration, onComplete }: UseGameTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, duration - elapsed);

    setTimeRemaining(remaining);

    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setIsRunning(false);
      onComplete();
    }
  }, [duration, onComplete]);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setTimeRemaining(duration);
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [duration, tick]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTimeRemaining(duration);
  }, [duration, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Update when duration changes
  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(duration);
    }
  }, [duration, isRunning]);

  const progress = timeRemaining / duration;

  return {
    timeRemaining,
    progress,
    isRunning,
    start,
    stop,
    reset,
  };
}
