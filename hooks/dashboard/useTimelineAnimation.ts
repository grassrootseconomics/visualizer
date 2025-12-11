/**
 * Hook for managing timeline animation state and controls
 */

import { useState, useEffect, useCallback } from "react";
import { add, isAfter } from "date-fns";

export interface DateRange {
  start: number;
  end: number;
}

export interface UseTimelineAnimationOptions {
  dateRange: DateRange;
}

export interface UseTimelineAnimationReturn {
  // Current date position (timestamp)
  date: number;
  setDate: (date: number) => void;
  // Animation state
  animate: boolean;
  setAnimate: (animate: boolean) => void;
  // Animation speed (hours per second)
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  // Controls
  play: () => void;
  pause: () => void;
  reset: () => void;
  // Progress (0-1)
  progress: number;
}

export function useTimelineAnimation({
  dateRange,
}: UseTimelineAnimationOptions): UseTimelineAnimationReturn {
  const [date, setDate] = useState(() => Date.now());
  const [animate, setAnimate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(24); // hours per second

  // Animation loop
  useEffect(() => {
    if (!animate) return;

    const intervalId = setInterval(() => {
      setDate((prevDate) => {
        const nextDate = add(prevDate, { hours: animationSpeed }).getTime();
        // Auto-stop and reset when reaching end
        if (isAfter(nextDate, dateRange.end)) {
          setAnimate(false);
          return dateRange.start;
        }
        return nextDate;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [animate, animationSpeed, dateRange.start, dateRange.end]);

  const play = useCallback(() => setAnimate(true), []);
  const pause = useCallback(() => setAnimate(false), []);
  const reset = useCallback(() => {
    setAnimate(false);
    setDate(dateRange.start);
  }, [dateRange.start]);

  // Calculate progress (0-1)
  const range = dateRange.end - dateRange.start;
  const progress = range > 0 ? (date - dateRange.start) / range : 0;

  return {
    date,
    setDate,
    animate,
    setAnimate,
    animationSpeed,
    setAnimationSpeed,
    play,
    pause,
    reset,
    progress: Math.max(0, Math.min(1, progress)),
  };
}
