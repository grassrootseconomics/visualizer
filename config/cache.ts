/**
 * Cache configuration
 */

export const CACHE_KEY = "graph-data-3";
export const CACHE_TTL_SECONDS = 86400 * 30; // 30 days

// Field reports cache
export const REPORTS_CACHE_KEY = "field-reports-1";
export const REPORTS_CACHE_TTL_SECONDS = 3600; // 1 hour

// Pools cache
export const POOLS_CACHE_KEY = "pools-1";
export const POOLS_CACHE_TTL_SECONDS = 3600; // 1 hour

// SWR configuration
export const SWR_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
