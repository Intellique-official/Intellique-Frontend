import { useState, useEffect, useRef, useCallback } from 'react';

const useCountdownTimer = (initialSeconds, options = {}) => {
  const {
    autoStart = true,
    onComplete,
    persistKey,
    format = 'mm:ss'
  } = options;

  const [seconds, setSeconds] = useState(() => {
    // Check for persisted time if persistKey is provided
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        const { endTime, duration } = JSON.parse(saved);
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        return remaining > 0 ? remaining : initialSeconds;
      }
    }
    return initialSeconds;
  });

  const [isActive, setIsActive] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(Date.now());
  const animationRef = useRef();

  // Format the timer display
  const formatTime = useCallback((totalSeconds) => {
    if (format === 'mm:ss') {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return {
        minutes: mins.toString().padStart(2, '0'),
        seconds: secs.toString().padStart(2, '0'),
        display: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        minutesRaw: mins,
        secondsRaw: secs
      };
    }
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60,
      display: `${totalSeconds}s`,
      minutesRaw: Math.floor(totalSeconds / 60),
      secondsRaw: totalSeconds % 60
    };
  }, [format]);

  // Save progress to localStorage
  const saveProgress = useCallback((remainingSeconds) => {
    if (persistKey && typeof window !== 'undefined') {
      const endTime = Date.now() + remainingSeconds * 1000;
      localStorage.setItem(persistKey, JSON.stringify({ 
        endTime, 
        duration: initialSeconds 
      }));
    }
  }, [persistKey, initialSeconds]);

  // Clear saved progress
  const clearProgress = useCallback(() => {
    if (persistKey && typeof window !== 'undefined') {
      localStorage.removeItem(persistKey);
    }
  }, [persistKey]);

  // Start the timer
  const start = useCallback(() => {
    if (seconds > 0 && !isActive) {
      setIsActive(true);
      startTimeRef.current = Date.now();
    }
  }, [seconds, isActive]);

  // Stop the timer
  const stop = useCallback(() => {
    setIsActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Reset to initial time
  const reset = useCallback((newSeconds = initialSeconds) => {
    stop();
    setSeconds(newSeconds);
    setIsComplete(false);
    clearProgress();
    if (autoStart) {
      start();
    }
  }, [initialSeconds, autoStart, stop, clearProgress, start]);

  // Restart with optional new duration
  const restart = useCallback((newSeconds = initialSeconds) => {
    stop();
    setSeconds(newSeconds);
    setIsComplete(false);
    clearProgress();
    setIsActive(true);
  }, [initialSeconds, stop, clearProgress]);

  // Timer logic using requestAnimationFrame for accuracy
  useEffect(() => {
    if (!isActive || seconds <= 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, initialSeconds - elapsed);
      
      setSeconds(remaining);
      saveProgress(remaining);
      
      if (remaining <= 0) {
        setIsComplete(true);
        setIsActive(false);
        clearProgress();
        onComplete?.();
      } else {
        animationRef.current = requestAnimationFrame(updateTimer);
      }
    };

    animationRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, seconds, initialSeconds, saveProgress, clearProgress, onComplete]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        // Recalculate time when tab becomes visible again
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, initialSeconds - elapsed);
        setSeconds(remaining);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, initialSeconds]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && !isComplete) {
      start();
    }
  }, [autoStart, isComplete, start]);

  return {
    seconds,
    isActive,
    isComplete,
    start,
    stop,
    reset,
    restart,
    formattedTime: formatTime(seconds),
    minutes: Math.floor(seconds / 60),
    rawSeconds: seconds % 60
  };
};

export default useCountdownTimer;