/**
 * Cache configuration
 */

export const CACHE_KEY = "graph-data-3";
export const CACHE_TTL_SECONDS = 3600 * 24; // 24 hours

// Field reports cache
export const REPORTS_CACHE_KEY = "field-reports-1";
export const REPORTS_CACHE_TTL_SECONDS = 3600; // 1 hour

// Pools cache
export const POOLS_CACHE_KEY = "pools-1";
export const POOLS_CACHE_TTL_SECONDS = 3600; // 1 hour

// Globe data cache
export const GLOBE_CACHE_KEY = "globe-data-1";
export const GLOBE_CACHE_TTL_SECONDS = 3600 * 24; // 24 hours

// SWR configuration
export const SWR_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
