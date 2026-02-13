/**
 * Bottom timeline bar component with histogram and controls
 */

import React from "react";
import type { DateRange } from "@hooks/dashboard";
import type { TimelineBucket } from "./sections";

export interface TimelineBarProps {
  date: number;
  setDate: (date: number) => void;
  dateRange: DateRange;
  timelineHistogram: TimelineBucket[];
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
}

export function TimelineBar({
  date,
  setDate,
  dateRange,
  timelineHistogram,
  animationSpeed,
  setAnimationSpeed,
}: TimelineBarProps) {
  if (timelineHistogram.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="bg-gray-900/70 backdrop-blur-xl rounded-xl border border-white/10 mx-2 mb-2 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-4 mx-auto">
          {/* Timeline with Histogram */}
          <div className="flex-1 min-w-0">
            {/* Date labels */}
            <div className="flex justify-between text-xs text-gray-400 mb-1 px-0.5">
              <span className="hidden sm:inline">
                {new Date(dateRange.start).toLocaleDateString()}
              </span>
              <span className="font-medium text-emerald-400">
                {new Date(date).toLocaleDateString()}
              </span>
              <span className="hidden sm:inline">
                {new Date(dateRange.end).toLocaleDateString()}
              </span>
            </div>

            {/* Histogram */}
            <div className="relative h-8 sm:h-10 flex items-end gap-px rounded overflow-hidden bg-white/[0.03]">
              {timelineHistogram.map((bucket, i) => {
                const isPast = bucket.endTime <= date;
                const isCurrent =
                  bucket.startTime <= date && bucket.endTime > date;
                return (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-150 cursor-pointer hover:opacity-80"
                    style={{
                      height: `${Math.max(bucket.normalized * 100, 2)}%`,
                      backgroundColor: isCurrent
                        ? "#10b981"
                        : isPast
                        ? "#6ee7b7"
                        : "rgba(255,255,255,0.12)",
                    }}
                    title={`${bucket.count} transactions`}
                    onClick={() => setDate(bucket.startTime)}
                  />
                );
              })}
              {/* Current position indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-400 pointer-events-none"
                style={{
                  left: `${
                    ((date - dateRange.start) /
                      (dateRange.end - dateRange.start)) *
                    100
                  }%`,
                  boxShadow: "0 0 6px rgba(52,211,153,0.5)",
                }}
              />
              {/* Slider */}
              <input
                min={dateRange.start}
                max={dateRange.end}
                onChange={(e) => setDate(parseInt(e.target.value))}
                type="range"
                value={date}
                className="slider-timeline"
              />
            </div>
          </div>

          {/* Speed Control (hidden on very small screens) */}
          <div className="hidden md:flex flex-col items-start mx-8 gap-2 flex-shrink-0">
            <label className="text-xs text-gray-400 whitespace-nowrap">
              Speed
            </label>
            <input
              min={1}
              max={168}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              type="range"
              value={animationSpeed}
              className="slider-glass"
            />
            <span className="text-xs text-gray-400 font-medium w-12">
              {animationSpeed}h/s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
