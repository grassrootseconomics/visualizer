/**
 * Timeline animation controls section
 */

import React from "react";
import {
  ChevronDownIcon,
  PauseIconSmall,
  PlayIconSmall,
  ResetIcon,
} from "@components/icons";
import type { DateRange } from "@hooks/dashboard";

export interface TimelineBucket {
  count: number;
  normalized: number;
  startTime: number;
  endTime: number;
}

export interface AnimationSectionProps {
  expanded: boolean;
  onToggle: () => void;
  date: number;
  setDate: (date: number) => void;
  animate: boolean;
  setAnimate: (animate: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  dateRange: DateRange;
  timelineHistogram: TimelineBucket[];
}

export function AnimationSection({
  expanded,
  onToggle,
  date,
  setDate,
  animate,
  setAnimate,
  animationSpeed,
  setAnimationSpeed,
  dateRange,
  timelineHistogram,
}: AnimationSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">Timeline Animation</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="p-3 sm:p-4 space-y-4">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex gap-1">
              <button
                className={`p-2.5 rounded-md transition-colors ${
                  animate
                    ? "text-amber-500 hover:text-amber-600 bg-none"
                    : "text-green-500 hover:text-green-600 bg-none"
                }`}
                onClick={() => setAnimate(!animate)}
                title={animate ? "Pause" : "Play"}
              >
                {animate ? (
                  <PauseIconSmall className="w-5 h-5" />
                ) : (
                  <PlayIconSmall className="w-5 h-5" />
                )}
              </button>
              <button
                className="p-2.5 rounded-md transition-colors text-gray-300 hover:text-gray-400"
                onClick={() => {
                  setAnimate(false);
                  setDate(dateRange.start);
                }}
                title="Reset"
              >
                <ResetIcon className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
              <label className="text-xs text-gray-500">Timeline</label>
              <span className="text-xs text-gray-400">
                {new Date(dateRange.start).toLocaleDateString()} -{" "}
                {new Date(dateRange.end).toLocaleDateString()}
              </span>
            </div>

            {/* Timeline Histogram */}
            {timelineHistogram.length > 0 && (
              <div className="relative h-12 mb-1 flex items-end gap-px rounded overflow-hidden bg-none">
                {timelineHistogram.map((bucket, i) => {
                  const isPast = bucket.endTime <= date;
                  const isCurrent =
                    bucket.startTime <= date && bucket.endTime > date;
                  return (
                    <div
                      key={i}
                      className="flex-1 transition-all duration-150"
                      style={{
                        height: `${Math.max(bucket.normalized * 100, 2)}%`,
                        backgroundColor: isCurrent
                          ? "#10b981"
                          : isPast
                          ? "#6ee7b7"
                          : "#d1d5db",
                      }}
                      title={`${bucket.count} transactions`}
                    />
                  );
                })}
                {/* Current position indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 pointer-events-none"
                  style={{
                    left: `${
                      ((date - dateRange.start) /
                        (dateRange.end - dateRange.start)) *
                      100
                    }%`,
                  }}
                />
                <input
                  min={dateRange.start}
                  max={dateRange.end}
                  onChange={(e) => setDate(parseInt(e.target.value))}
                  type="range"
                  value={date}
                  className="absolute top-0 left-[-8px] right-[-10px] bottom-0 bg-transparent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-transparent
                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:h-5
                    [&::-moz-range-thumb]:w-5
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-transparent"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Animation Speed</label>
              <span className="text-xs text-gray-700 font-medium">
                {animationSpeed}h/sec
              </span>
            </div>
            <input
              min={1}
              max={168}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              type="range"
              value={animationSpeed}
              className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1h</span>
              <span>1 day</span>
              <span>1 week</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
