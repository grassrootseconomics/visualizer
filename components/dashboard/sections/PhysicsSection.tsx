/**
 * Graph physics controls section
 */

import React from "react";
import { ChevronDownIcon } from "@components/icons";
import type { PhysicsInputs } from "@hooks/dashboard";

export interface PhysicsSectionProps {
  expanded: boolean;
  onToggle: () => void;
  inputs: PhysicsInputs;
  setChargeStrengthInput: (value: number) => void;
  setLinkDistanceInput: (value: number) => void;
  setCenterGravityInput: (value: number) => void;
  resetToDefaults: () => void;
}

export function PhysicsSection({
  expanded,
  onToggle,
  inputs,
  setChargeStrengthInput,
  setLinkDistanceInput,
  setCenterGravityInput,
  resetToDefaults,
}: PhysicsSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">Graph Physics</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="p-3 sm:p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Charge Strength</label>
              <span className="text-xs text-gray-700 font-medium">
                {inputs.chargeStrengthInput}
              </span>
            </div>
            <input
              min={-100}
              max={0}
              onChange={(e) => setChargeStrengthInput(parseInt(e.target.value))}
              type="range"
              value={inputs.chargeStrengthInput}
              className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Repel</span>
              <span>Neutral</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Link Distance</label>
              <span className="text-xs text-gray-700 font-medium">
                {inputs.linkDistanceInput}px
              </span>
            </div>
            <input
              min={5}
              max={100}
              onChange={(e) => setLinkDistanceInput(parseInt(e.target.value))}
              type="range"
              value={inputs.linkDistanceInput}
              className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Close</span>
              <span>Far</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Center Gravity</label>
              <span className="text-xs text-gray-700 font-medium">
                {inputs.centerGravityInput}
              </span>
            </div>
            <input
              min={0}
              max={5}
              step={0.1}
              onChange={(e) => setCenterGravityInput(parseFloat(e.target.value))}
              type="range"
              value={inputs.centerGravityInput}
              className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>None</span>
              <span>Strong</span>
            </div>
          </div>

          <button
            className="w-full px-3 py-2 sm:py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}
