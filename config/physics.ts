/**
 * Physics simulation configuration
 */

// Physics defaults - tuned for large graphs
export const DEFAULT_PHYSICS = {
  chargeStrength: -8, // Reduced from -15 (less computation, O(n^2) savings)
  linkDistance: 30, // Increased from 20 (less tight packing = faster settling)
  centerGravity: 0.8, // Slightly reduced for more spread
} as const;

// Physics control limits for UI sliders
export const PHYSICS_LIMITS = {
  chargeStrength: { min: -100, max: 0 },
  linkDistance: { min: 5, max: 100 },
  centerGravity: { min: 0, max: 5, step: 0.1 },
} as const;

// Debounce delay for physics updates (prevents simulation reheat spam)
export const PHYSICS_DEBOUNCE_MS = 150;
