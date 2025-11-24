import { useEffect, useRef, useState } from 'react';

interface UseInactivityTimerOptions {
  timeout: number; // in milliseconds
  onInactive: () => void;
  onActive: () => void;
}

export const useInactivityTimer = ({ 
  timeout, 
  onInactive, 
  onActive 
}: UseInactivityTimerOptions) => {
  const [isInactive, setIsInactive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isInactive) {
      setIsInactive(false);
      onActive();
    }

    timerRef.current = setTimeout(() => {
      setIsInactive(true);
      onInactive();
    }, timeout);
  };

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Start the timer initially
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [timeout, onInactive, onActive, isInactive]);

  const forceInactive = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsInactive(true);
    onInactive();
  };

  const forceActive = () => {
    resetTimer();
  };

  return { isInactive, forceInactive, forceActive };
};