/**
 * Centralized configuration exports
 */

// Application constants
export {
  FAUCET_ADDRESS,
  CELOSCAN_BASE_URL,
  SARAFU_NETWORK_BASE_URL,
  TWO_MONTHS_MS,
  ONE_YEAR_MS,
} from "./constants";

// Cache configuration
export { CACHE_KEY, CACHE_TTL_SECONDS, SWR_REFRESH_INTERVAL } from "./cache";

// Graph configuration
export {
  GRAPH_CONFIG,
  ANIMATION_QUEUE_CONFIG,
  PULSE_CONFIG,
  LABEL_STYLE,
} from "./graph";

// Physics configuration
export {
  DEFAULT_PHYSICS,
  PHYSICS_LIMITS,
  PHYSICS_DEBOUNCE_MS,
} from "./physics";
