/**
 * Hook for managing debounced physics settings
 * Provides immediate UI feedback while debouncing actual graph updates
 */

import { useState, useEffect } from "react";
import { DEFAULT_PHYSICS, PHYSICS_DEBOUNCE_MS } from "@/config/physics";

export interface PhysicsSettings {
  chargeStrength: number;
  linkDistance: number;
  centerGravity: number;
}

export interface PhysicsInputs {
  chargeStrengthInput: number;
  linkDistanceInput: number;
  centerGravityInput: number;
}

export interface UsePhysicsSettingsReturn {
  // Input values (for immediate UI feedback)
  inputs: PhysicsInputs;
  // Debounced values (applied to graph)
  values: PhysicsSettings;
  // Setters for input values
  setChargeStrengthInput: (value: number) => void;
  setLinkDistanceInput: (value: number) => void;
  setCenterGravityInput: (value: number) => void;
  // Reset to defaults
  resetToDefaults: () => void;
}

export function usePhysicsSettings(): UsePhysicsSettingsReturn {
  // Input values (immediate UI feedback)
  const [chargeStrengthInput, setChargeStrengthInput] = useState<number>(
    DEFAULT_PHYSICS.chargeStrength
  );
  const [linkDistanceInput, setLinkDistanceInput] = useState<number>(
    DEFAULT_PHYSICS.linkDistance
  );
  const [centerGravityInput, setCenterGravityInput] = useState<number>(
    DEFAULT_PHYSICS.centerGravity
  );

  // Debounced values (applied to graph)
  const [chargeStrength, setChargeStrength] = useState<number>(
    DEFAULT_PHYSICS.chargeStrength
  );
  const [linkDistance, setLinkDistance] = useState<number>(
    DEFAULT_PHYSICS.linkDistance
  );
  const [centerGravity, setCenterGravity] = useState<number>(
    DEFAULT_PHYSICS.centerGravity
  );

  // Debounce physics updates to prevent simulation reheat spam
  useEffect(() => {
    const timer = setTimeout(() => {
      setChargeStrength(chargeStrengthInput);
      setLinkDistance(linkDistanceInput);
      setCenterGravity(centerGravityInput);
    }, PHYSICS_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [chargeStrengthInput, linkDistanceInput, centerGravityInput]);

  const resetToDefaults = () => {
    setChargeStrengthInput(DEFAULT_PHYSICS.chargeStrength);
    setLinkDistanceInput(DEFAULT_PHYSICS.linkDistance);
    setCenterGravityInput(DEFAULT_PHYSICS.centerGravity);
  };

  return {
    inputs: {
      chargeStrengthInput,
      linkDistanceInput,
      centerGravityInput,
    },
    values: {
      chargeStrength,
      linkDistance,
      centerGravity,
    },
    setChargeStrengthInput,
    setLinkDistanceInput,
    setCenterGravityInput,
    resetToDefaults,
  };
}
