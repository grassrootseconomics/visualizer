/**
 * Hook for preloading field report images based on timeline position
 * and tracking their load completion state
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldReport } from "@/types";

export interface UseImagePreloaderOptions {
  reports: FieldReport[];
  currentDate: number;
  selectedVoucherAddresses: Set<string>;
  preloadWindowMs?: number; // Default: 30 days ahead
}

export interface UseImagePreloaderReturn {
  isImageLoaded: (url: string) => boolean;
  resetPreloaded: () => void;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function useImagePreloader({
  reports,
  currentDate,
  selectedVoucherAddresses,
  preloadWindowMs = THIRTY_DAYS_MS,
}: UseImagePreloaderOptions): UseImagePreloaderReturn {
  const preloadedUrls = useRef<Set<string>>(new Set());
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());

  // Eagerly preload all matching report images on initial data load
  const eagerPreloadDone = useRef(false);
  useEffect(() => {
    if (eagerPreloadDone.current || reports.length === 0) return;
    eagerPreloadDone.current = true;

    for (const report of reports) {
      if (!report.image_url) continue;
      if (preloadedUrls.current.has(report.image_url)) continue;

      const hasMatch = report.vouchers.some((v) =>
        selectedVoucherAddresses.has(v)
      );
      if (!hasMatch) continue;

      const url = report.image_url;
      preloadedUrls.current.add(url);
      const img = new Image();
      img.onload = () => {
        setLoadedUrls((prev) => {
          const next = new Set(prev);
          next.add(url);
          return next;
        });
      };
      img.onerror = () => {
        // Mark as loaded on error too so the card isn't blocked forever
        setLoadedUrls((prev) => {
          const next = new Set(prev);
          next.add(url);
          return next;
        });
      };
      img.src = url;
    }
  }, [reports, selectedVoucherAddresses]);

  // Window-based preloading for any new reports not yet handled
  useEffect(() => {
    const upcomingCutoff = currentDate + preloadWindowMs;

    for (const report of reports) {
      if (!report.image_url) continue;
      if (preloadedUrls.current.has(report.image_url)) continue;

      const hasMatch = report.vouchers.some((v) =>
        selectedVoucherAddresses.has(v)
      );
      if (!hasMatch) continue;

      if (report.period_from <= upcomingCutoff) {
        const url = report.image_url;
        preloadedUrls.current.add(url);
        const img = new Image();
        img.onload = () => {
          setLoadedUrls((prev) => {
            const next = new Set(prev);
            next.add(url);
            return next;
          });
        };
        img.onerror = () => {
          setLoadedUrls((prev) => {
            const next = new Set(prev);
            next.add(url);
            return next;
          });
        };
        img.src = url;
      }
    }
  }, [reports, currentDate, selectedVoucherAddresses, preloadWindowMs]);

  const isImageLoaded = useCallback(
    (url: string) => loadedUrls.has(url),
    [loadedUrls]
  );

  const resetPreloaded = useCallback(() => {
    preloadedUrls.current.clear();
    eagerPreloadDone.current = false;
    setLoadedUrls(new Set());
  }, []);

  return { isImageLoaded, resetPreloaded };
}
