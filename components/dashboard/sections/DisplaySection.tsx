/**
 * Display options section (graph type, recent only filter, timeline bar toggle)
 */

import React from "react";
import { ChevronDownIcon } from "@components/icons";

export interface DisplaySectionProps {
  expanded: boolean;
  onToggle: () => void;
  graphType: "2D" | "3D";
  setGraphType: (type: "2D" | "3D") => void;
  showRecentOnly: boolean;
  setShowRecentOnly: (show: boolean) => void;
  showTimelineBar: boolean;
  setShowTimelineBar: (show: boolean) => void;
  showReports: boolean;
  setShowReports: (show: boolean) => void;
}

export function DisplaySection({
  expanded,
  onToggle,
  graphType,
  setGraphType,
  showRecentOnly,
  setShowRecentOnly,
  showTimelineBar,
  setShowTimelineBar,
  showReports,
  setShowReports,
}: DisplaySectionProps) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/[0.08] transition-colors"
      >
        <span className="font-medium text-gray-200">Display Options</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="p-3 sm:p-4 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">
              Graph View
            </label>
            <div className="flex gap-2">
              <button
                className={`flex-1 px-4 py-2.5 sm:py-2 rounded-md font-medium transition-colors ${
                  graphType === "2D"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
                onClick={() => setGraphType("2D")}
              >
                2D View
              </button>
              <button
                className={`flex-1 px-4 py-2.5 sm:py-2 rounded-md font-medium transition-colors ${
                  graphType === "3D"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
                onClick={() => setGraphType("3D")}
              >
                3D View
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showRecentOnly}
                onChange={(e) => setShowRecentOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-500 border-white/20 rounded focus:ring-emerald-500 bg-white/5 cursor-pointer"
              />
              <div>
                <span className="text-sm text-gray-200 font-medium">
                  Show recent activity only
                </span>
                <p className="text-xs text-gray-400">
                  Only show nodes and links active in the last 2 months
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showTimelineBar}
                onChange={(e) => setShowTimelineBar(e.target.checked)}
                className="w-4 h-4 text-emerald-500 border-white/20 rounded focus:ring-emerald-500 bg-white/5 cursor-pointer"
              />
              <div>
                <span className="text-sm text-gray-200 font-medium">
                  Show timeline bar
                </span>
                <p className="text-xs text-gray-400">
                  Display timeline controls at the bottom of the screen
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showReports}
                onChange={(e) => setShowReports(e.target.checked)}
                className="w-4 h-4 text-emerald-500 border-white/20 rounded focus:ring-emerald-500 bg-white/5 cursor-pointer"
              />
              <div>
                <span className="text-sm text-gray-200 font-medium">
                  Show field reports
                </span>
                <p className="text-xs text-gray-400">
                  Display approved field reports during animation
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
