import { useState, useEffect, useRef } from 'react';

export type CounterOptions = {
  initialCount?: number; // The count to start from, default 0
  interval?: number; // in milliseconds, default to 1000 (1 second)
  onComplete?: (currentCount: number) => void; // callback when reaching a specific count (optional)
  targetCount?: number; // if specified, stops at this target count
};

const useRealTimeCounter = ({
  initialCount = 0,
  interval = 100,
  onComplete,
  targetCount,
}: CounterOptions) => {
  const [count, setCount] = useState(initialCount);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tick = () => {
      setCount((prevCount) => {
        const newCount = prevCount + 1;
        if (targetCount !== undefined && newCount >= targetCount) {
          if (onComplete) onComplete(newCount);
          clearInterval(timerRef.current!);
          return targetCount;
        }
        return newCount;
      });
    };

    // Start the timer
    timerRef.current = setInterval(tick, interval);

    // Clean up the timer on unmount
    return () => clearInterval(timerRef.current!);
  }, [interval, onComplete, targetCount]);

  return count;
};

export default useRealTimeCounter;
