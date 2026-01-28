/**
 * Hook for preloading field report images based on timeline position
 */

import { useCallback, useEffect, useRef } from "react";
import type { FieldReport } from "@/types";

export interface UseImagePreloaderOptions {
  reports: FieldReport[];
  currentDate: number;
  selectedVoucherAddresses: Set<string>;
  preloadWindowMs?: number; // Default: 7 days ahead
}

export interface UseImagePreloaderReturn {
  resetPreloaded: () => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useImagePreloader({
  reports,
  currentDate,
  selectedVoucherAddresses,
  preloadWindowMs = SEVEN_DAYS_MS,
}: UseImagePreloaderOptions): UseImagePreloaderReturn {
  const preloadedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const upcomingCutoff = currentDate + preloadWindowMs;

    for (const report of reports) {
      if (!report.image_url) continue;
      if (preloadedUrls.current.has(report.image_url)) continue;

      // Check if report has any vouchers matching selected ones
      const hasMatch = report.vouchers.some((v) =>
        selectedVoucherAddresses.has(v)
      );
      if (!hasMatch) continue;

      // Preload if within window or currently visible (past period_from)
      if (report.period_from <= upcomingCutoff) {
        const img = new Image();
        img.src = report.image_url;
        preloadedUrls.current.add(report.image_url);
      }
    }
  }, [reports, currentDate, selectedVoucherAddresses, preloadWindowMs]);

  const resetPreloaded = useCallback(() => {
    preloadedUrls.current.clear();
  }, []);

  return { resetPreloaded };
}
