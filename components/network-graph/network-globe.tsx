/**
 * 3D Globe geographic visualization component
 *
 * Renders accounts, vouchers, and pools as points on a 3D globe
 * with transaction arcs between them.
 */

import React from "react";
import dynamic from "next/dynamic";
import { useGlobeData } from "./use-globe-data";
import type { GlobeData, GlobePoint, GlobeArc } from "@/types/globe";
import { TWO_MONTHS_MS } from "@/config/constants";

// Dynamic import to avoid SSR issues with Three.js
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export interface GlobeComponentProps {
  globeData: GlobeData;
  animate: boolean;
  selectedVoucherAddresses: Set<string>;
  currentDate: number;
  showRecentOnly: boolean;
  onPointClick?: (point: GlobePoint) => void;
  onArcClick?: (arc: GlobeArc) => void;
}

// Custom comparator for React.memo
function arePropsEqual(
  prev: GlobeComponentProps,
  next: GlobeComponentProps
): boolean {
  return (
    prev.globeData === next.globeData &&
    prev.animate === next.animate &&
    prev.currentDate === next.currentDate &&
    prev.showRecentOnly === next.showRecentOnly &&
    prev.selectedVoucherAddresses === next.selectedVoucherAddresses
  );
}

export const NetworkGlobe = React.memo(function NetworkGlobe({
  globeData,
  animate,
  selectedVoucherAddresses,
  currentDate,
  showRecentOnly,
  onPointClick,
  onArcClick,
}: GlobeComponentProps) {
  const globeRef = React.useRef<any>(null);

  const { filteredPoints, filteredArcs, rings } = useGlobeData({
    globeData,
    selectedVoucherAddresses,
    currentDate,
    showRecentOnly,
    twoMonthsMs: TWO_MONTHS_MS,
    animate,
  });

  // Set initial camera position and auto-rotate when globe is ready
  const handleGlobeReady = React.useCallback(() => {
    // react-kapsule methods may not be on the ref immediately after onGlobeReady
    // Defer to next frame to ensure the ref is fully populated
    requestAnimationFrame(() => {
      const globe = globeRef.current;
      if (!globe?.pointOfView) return;

      // Point camera at Kenya
      globe.pointOfView({ lat: 0.5, lng: 37.5, altitude: 2.5 }, 1000);

      // Enable auto-rotate
      const controls = globe.controls?.();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
      }
    });
  }, []);

  // Stop auto-rotate when user interacts
  const handleInteraction = React.useCallback(() => {
    const globe = globeRef.current;
    if (!globe?.controls) return;
    const controls = globe.controls();
    if (controls) controls.autoRotate = false;
  }, []);

  // Point accessors
  const pointAltitude = React.useCallback(
    (d: object) => {
      const p = d as GlobePoint;
      if (p.type === "voucher") return 0.02;
      if (p.type === "pool") return 0.03;
      return 0.005 + Math.min(Math.log10(p.value + 1) * 0.005, 0.03);
    },
    []
  );

  const pointRadius = React.useCallback(
    (d: object) => {
      const p = d as GlobePoint;
      if (p.type === "voucher") return 0.4;
      if (p.type === "pool") return 0.5;
      return Math.max(0.1, Math.min(Math.sqrt(p.value) * 0.05, 0.6));
    },
    []
  );

  const pointLabel = React.useCallback(
    (d: object) => {
      const p = d as GlobePoint;
      const typeLabel = p.type.charAt(0).toUpperCase() + p.type.slice(1);
      const location = p.locationName ? ` (${p.locationName})` : "";
      const extra =
        p.type === "account"
          ? ` - ${p.value} txns`
          : p.type === "voucher"
            ? ` - ${p.voucherSymbol ?? ""}`
            : "";
      return `<div style="background:rgba(0,0,0,0.8);padding:6px 10px;border-radius:6px;font-size:12px;color:#fff;border:1px solid rgba(255,255,255,0.1)">
        <b>${p.label}</b>${location}<br/>
        <span style="color:#9CA3AF">${typeLabel}${extra}</span>
      </div>`;
    },
    []
  );

  // Arc accessors
  const arcStroke = React.useCallback(
    (d: object) => {
      const a = d as GlobeArc;
      return Math.max(0.3, Math.min(Math.log10(a.txCount + 1) * 0.8, 3));
    },
    []
  );

  const arcLabel = React.useCallback(
    (d: object) => {
      const a = d as GlobeArc;
      return `<div style="background:rgba(0,0,0,0.8);padding:6px 10px;border-radius:6px;font-size:12px;color:#fff;border:1px solid rgba(255,255,255,0.1)">
        <b>${a.tokenName}</b> (${a.tokenSymbol})<br/>
        <span style="color:#9CA3AF">${a.txCount} transactions</span>
      </div>`;
    },
    []
  );

  const arcColor = React.useCallback(
    (d: object) => {
      const a = d as GlobeArc;
      return [a.color, a.color];
    },
    []
  );

  const handlePointClick = React.useCallback(
    (point: object) => {
      handleInteraction();
      onPointClick?.(point as GlobePoint);
    },
    [onPointClick, handleInteraction]
  );

  const handleArcClick = React.useCallback(
    (arc: object) => {
      handleInteraction();
      onArcClick?.(arc as GlobeArc);
    },
    [onArcClick, handleInteraction]
  );

  // Coverage stats
  const coveragePct =
    globeData.totalAccountCount > 0
      ? Math.round(
          ((globeData.totalAccountCount - globeData.unmappedAccountCount) /
            globeData.totalAccountCount) *
            100
        )
      : 0;

  return (
    <div className="w-full h-full relative" onMouseDown={handleInteraction}>
      <Globe
        ref={globeRef}
        globeImageUrl="/textures/earth-night.jpg"
        bumpImageUrl="/textures/earth-topology.png"
        backgroundImageUrl="/textures/night-sky.png"
        atmosphereColor="#10B981"
        atmosphereAltitude={0.15}
        onGlobeReady={handleGlobeReady}
        // Points layer
        pointsData={filteredPoints}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={pointAltitude}
        pointRadius={pointRadius}
        pointColor="color"
        pointLabel={pointLabel}
        onPointClick={handlePointClick}
        // Arcs layer
        arcsData={filteredArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={arcColor}
        arcStroke={arcStroke}
        arcLabel={arcLabel}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        onArcClick={handleArcClick}
        // Rings layer
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringColor="color"
        ringMaxRadius="maxRadius"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />

      {/* Coverage indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
        <div className="text-xs text-gray-400">
          <span className="text-emerald-400 font-medium">{coveragePct}%</span>{" "}
          of accounts geo-located
        </div>
        <div className="text-xs text-gray-500">
          {filteredPoints.filter((p) => p.type === "account").length} accounts
          {" / "}
          {filteredArcs.length} transaction flows
        </div>
      </div>
    </div>
  );
}, arePropsEqual);
