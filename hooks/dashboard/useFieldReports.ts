/**
 * Hook for filtering field reports by current animation date
 * and managing visibility states for smooth animations
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { FieldReport, VisibleReport, ReportVisibility } from "@/types";

export interface UseFieldReportsOptions {
  reports: FieldReport[];
  currentDate: number;
  selectedVoucherAddresses: Set<string>;
  maxVisible?: number;
}

export interface UseFieldReportsReturn {
  visibleReports: VisibleReport[];
  dismissedIds: Set<number>;
  dismissReport: (id: number) => void;
  resetDismissed: () => void;
}

export function useFieldReports({
  reports,
  currentDate,
  selectedVoucherAddresses,
  maxVisible = 3,
}: UseFieldReportsOptions): UseFieldReportsReturn {
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const prevVisibleRef = useRef<Set<number>>(new Set());

  // Calculate visible reports based on current date and selected vouchers
  const visibleReports = useMemo(() => {
    const active: VisibleReport[] = [];

    for (const report of reports) {
      // Skip dismissed reports
      if (dismissedIds.has(report.id)) continue;

      // Skip reports that don't match any selected voucher
      const hasMatchingVoucher = report.vouchers.some((v) =>
        selectedVoucherAddresses.has(v)
      );
      if (!hasMatchingVoucher) continue;

      const periodFrom = report.period_from;
      const periodTo = report.period_to;

      // Check if report should be visible at current date
      const hasStarted = currentDate >= periodFrom;
      const hasEnded = periodTo !== null && currentDate > periodTo;

      // Skip future reports
      if (!hasStarted) continue;

      // Determine visibility state
      const wasVisible = prevVisibleRef.current.has(report.id);
      let visibility: ReportVisibility;

      if (hasEnded) {
        visibility = "exiting";
      } else if (!wasVisible) {
        visibility = "entering";
      } else {
        visibility = "visible";
      }

      active.push({ ...report, visibility });
    }

    // Sort by period_from descending (most recent first)
    active.sort((a, b) => b.period_from - a.period_from);

    // Limit visible count
    return active.slice(0, maxVisible);
  }, [reports, currentDate, selectedVoucherAddresses, dismissedIds, maxVisible]);

  // Update tracking ref after render
  useEffect(() => {
    const newVisibleIds = new Set(
      visibleReports
        .filter((r) => r.visibility !== "exiting")
        .map((r) => r.id)
    );
    prevVisibleRef.current = newVisibleIds;
  }, [visibleReports]);

  const dismissReport = useCallback((id: number) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  }, []);

  const resetDismissed = useCallback(() => {
    setDismissedIds(new Set());
  }, []);

  return {
    visibleReports,
    dismissedIds,
    dismissReport,
    resetDismissed,
  };
}
