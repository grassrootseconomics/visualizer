import { redis } from "./kv";
import { gzipSync, gunzipSync } from "zlib";

/**
 * Debug logging that only runs in development
 */
function debugLog(message: string, ...optionalParams: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] ${message}`, ...optionalParams);
  }
}

/**
 * Compress a string using gzip and return as base64
 */
function compress(data: string): string {
  const compressed = gzipSync(Buffer.from(data, "utf-8"));
  return compressed.toString("base64");
}

/**
 * Decompress a base64 gzip string
 */
function decompress(data: string): string {
  const buffer = Buffer.from(data, "base64");
  const decompressed = gunzipSync(buffer);
  return decompressed.toString("utf-8");
}

/**
 * Get a value from KV if present; otherwise compute it, store it with an expiry, and return it.
 * @param key Unique cache key
 * @param expiryInSeconds Time-to-live in seconds for the cached value
 * @param fetchFunction Function that returns the fresh value (can be sync or async)
 * @returns The cached or freshly-fetched value
 */
export async function cacheWithExpiry<T>(
  key: string,
  expiryInSeconds: number,
  fetchFunction: () => T | Promise<T>,
  bypass?: boolean
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (!bypass && cached !== null && cached !== undefined) {
    try {
      // Data is stored as compressed base64 string
      if (typeof cached === "string") {
        const decompressed = decompress(cached);
        debugLog(`Loaded (compressed): ${key}`);
        return JSON.parse(decompressed) as T;
      }
      debugLog(`Fetched from cache: ${key}`);
      return cached as unknown as T;
    } catch (err) {
      // Log error but fall through to fetch fresh data
      debugLog(`Deserialization failed for key: ${key}`, err);
      // Fall through to fetch fresh data
    }
  }

  // Compute, then store with TTL
  const value = await Promise.resolve(fetchFunction());

  try {
    // Compress and store with TTL
    const jsonStr = JSON.stringify(value);
    const compressed = compress(jsonStr);
    const originalSize = Buffer.byteLength(jsonStr, "utf-8");
    const compressedSize = Buffer.byteLength(compressed, "utf-8");
    debugLog(
      `Compressing: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${((1 - compressedSize / originalSize) * 100).toFixed(1)}% reduction)`
    );
    await redis.set(key, compressed, { ex: expiryInSeconds });
    debugLog(`Set cache: ${key}`);
  } catch (err) {
    // Cache write failed - log but return the value anyway
    debugLog(`Failed to set cache: ${key}`, err);
    // Continue execution - cache write failure should not break the application
  }

  return value;
}
