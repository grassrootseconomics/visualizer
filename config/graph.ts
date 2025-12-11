/**
 * Graph visualization configuration
 */

// Graph simulation config - optimized for large graphs (1000+ nodes, 10K+ links)
export const GRAPH_CONFIG = {
  d3AlphaDecay: 0.08, // Faster cooling (was 0.02) - settles ~4x faster
  d3VelocityDecay: 0.5, // Higher damping (was 0.3) - less oscillation
  backgroundColor: "rgba(0,0,0,0)",
} as const;

// Animation queue config for incremental rendering
export const ANIMATION_QUEUE_CONFIG = {
  minLinksPerTick: 10, // Minimum links to add per tick
  maxLinksPerTick: 150, // Maximum links to add per tick
  targetTicksForQueue: 40, // Target number of ticks to clear queue
  tickIntervalMs: 30, // Interval between ticks in ms
} as const;

// Pulse effect configuration
export const PULSE_CONFIG = {
  duration: 1500, // Duration in ms
  colors: {
    core: 0xffffff,
    mid: 0xffee66,
    particle: 0xffff99,
  },
} as const;

// Label styling
export const LABEL_STYLE =
  "padding:4px 8px;border-radius:8px;background-color:white;color:grey";
