/**
 * Hook for processing and filtering globe visualization data
 *
 * Handles filtering by selected voucher addresses and current date,
 * and manages ring pulse effects during animation.
 */

import React from "react";
import type { GlobeData, GlobePoint, GlobeArc, GlobeRing } from "@/types/globe";

const RING_DURATION = 2000; // ms before a ring expires
const RING_MAX_RADIUS = 3;
const RING_PROPAGATION_SPEED = 2;

interface UseGlobeDataOptions {
  globeData: GlobeData;
  selectedVoucherAddresses: Set<string>;
  currentDate: number;
  showRecentOnly: boolean;
  twoMonthsMs: number;
  animate: boolean;
}

interface UseGlobeDataResult {
  filteredPoints: GlobePoint[];
  filteredArcs: GlobeArc[];
  rings: GlobeRing[];
}

export function useGlobeData({
  globeData,
  selectedVoucherAddresses,
  currentDate,
  showRecentOnly,
  twoMonthsMs,
  animate,
}: UseGlobeDataOptions): UseGlobeDataResult {
  const [rings, setRings] = React.useState<GlobeRing[]>([]);
  const prevDateRef = React.useRef(currentDate);

  // Filter arcs by date and selected vouchers
  const filteredArcs = React.useMemo(() => {
    const recencyCutoff = showRecentOnly ? currentDate - twoMonthsMs : 0;

    return globeData.arcs.filter((arc) => {
      // Date filtering
      if (arc.date > currentDate) return false;
      if (arc.date < recencyCutoff) return false;

      // Voucher filtering (if tokens are selected)
      if (selectedVoucherAddresses.size > 0) {
        return selectedVoucherAddresses.has(arc.contractAddress);
      }
      return true;
    });
  }, [globeData.arcs, currentDate, showRecentOnly, twoMonthsMs, selectedVoucherAddresses]);

  // Filter points - show accounts that participate in visible arcs
  const filteredPoints = React.useMemo(() => {
    // Collect all addresses that appear in filtered arcs
    const activeAddresses = new Set<string>();
    for (const arc of filteredArcs) {
      activeAddresses.add(arc.sourceId);
      activeAddresses.add(arc.targetId);
    }

    return globeData.points.filter((point) => {
      // Always show voucher and pool points if they match selected vouchers
      if (point.type === "voucher") {
        if (selectedVoucherAddresses.size > 0 && point.voucherAddress) {
          return selectedVoucherAddresses.has(point.voucherAddress);
        }
        return true;
      }
      if (point.type === "pool") return true;

      // For accounts, only show if they participate in visible arcs
      return activeAddresses.has(point.id);
    });
  }, [globeData.points, filteredArcs, selectedVoucherAddresses]);

  // Generate ring pulses when new arcs become visible during animation
  React.useEffect(() => {
    if (!animate) return;

    const prevDate = prevDateRef.current;
    prevDateRef.current = currentDate;

    // Find arcs that just became visible (date between prevDate and currentDate)
    const newArcs = globeData.arcs.filter(
      (arc) => arc.date > prevDate && arc.date <= currentDate
    );

    if (newArcs.length === 0) return;

    // Create rings at the start of new arcs (limit to avoid overload)
    const newRings: GlobeRing[] = newArcs.slice(0, 5).map((arc) => ({
      lat: arc.startLat,
      lng: arc.startLng,
      maxRadius: RING_MAX_RADIUS,
      propagationSpeed: RING_PROPAGATION_SPEED,
      repeatPeriod: RING_DURATION,
      color: arc.color,
    }));

    setRings((prev) => [...prev, ...newRings]);

    // Clean up rings after duration
    const timer = setTimeout(() => {
      setRings((prev) => prev.slice(newRings.length));
    }, RING_DURATION);

    return () => clearTimeout(timer);
  }, [animate, currentDate, globeData.arcs]);

  // Clear rings when animation stops
  React.useEffect(() => {
    if (!animate) setRings([]);
  }, [animate]);

  return { filteredPoints, filteredArcs, rings };
}
