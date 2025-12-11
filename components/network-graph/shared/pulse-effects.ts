/**
 * Pulse effect constants and utilities for graph visualization
 * Shared between 2D and 3D graph components
 */

import * as THREE from "three";
import { PULSE_CONFIG } from "@/config/graph";

// Pulse timing
export const PULSE_DURATION = PULSE_CONFIG.duration;

// Brighter pulse colors for 3D (shared instances - never dispose these)
export const PULSE_COLOR_CORE = new THREE.Color(PULSE_CONFIG.colors.core); // Pure white core
export const PULSE_COLOR_MID = new THREE.Color(PULSE_CONFIG.colors.mid); // Bright yellow
export const PARTICLE_COLOR = new THREE.Color(PULSE_CONFIG.colors.particle); // Bright yellow particle

// Reusable color objects for getLinkColor to avoid per-frame allocations
export const REUSABLE_COLORS = {
  bright: new THREE.Color(),
  base: new THREE.Color(),
  result: new THREE.Color(),
};

// Shared geometry pool - created once, reused everywhere
// Using unit size geometries (radius=1) that get scaled at runtime
export const SHARED_GEOMETRIES = {
  sphere: new THREE.SphereGeometry(1, 10, 10), // Reduced segments for performance
  sphereLow: new THREE.SphereGeometry(1, 6, 6), // Lower detail for particles/trails
  torus: new THREE.TorusGeometry(1, 0.08, 6, 20), // Unit torus for rings
};

// 2D pulse colors (RGBA strings)
export const PULSE_COLORS_2D = {
  outerPulse: (intensity: number) => `rgba(255, 200, 100, ${intensity * 0.4})`,
  innerGlow: (intensity: number) => `rgba(255, 150, 50, ${intensity * 0.6})`,
  linkPulse: (intensity: number) => `rgba(255, 200, 100, ${intensity})`,
};

/**
 * Calculate pulse intensity based on time elapsed
 * Returns a value between 0 and 1
 */
export function getPulseIntensity(addedTime?: number): number {
  if (!addedTime) return 0;

  const elapsed = Date.now() - addedTime;
  if (elapsed > PULSE_DURATION) return 0;

  const progress = elapsed / PULSE_DURATION;
  // Oscillating pulse that decays over time
  return (
    Math.cos(progress * Math.PI * 3) * (1 - progress) * 0.5 +
    0.5 * (1 - progress)
  );
}

/**
 * Store for dynamic pulse objects that need updating (3D)
 */
export interface PulseObjects {
  particles: Map<string, THREE.Group>;
  nodeGlows: Map<string, THREE.Group>;
}
