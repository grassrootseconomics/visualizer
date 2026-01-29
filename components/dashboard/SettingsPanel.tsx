/**
 * Settings sidebar panel containing all configuration sections
 */

import React from "react";
import { CloseIcon } from "@components/icons";
import { StatsBar } from "./StatsBar";
import {
  PoolSection,
  VoucherSection,
  AnimationSection,
  DisplaySection,
  PhysicsSection,
} from "./sections";
import type { TimelineBucket } from "./sections";
import type { Pool } from "@/types";
import type { Voucher } from "@/types/voucher";
import type { DateRange, PhysicsInputs } from "@hooks/dashboard";

export interface ExpandedSections {
  pools: boolean;
  vouchers: boolean;
  animation: boolean;
  display: boolean;
  physics: boolean;
}

export interface SettingsPanelProps {
  // Panel state
  onClose: () => void;

  // Stats
  nodeCount: number;
  linkCount: number;
  voucherCount: number;

  // Sections
  expandedSections: ExpandedSections;
  toggleSection: (section: keyof ExpandedSections) => void;

  // Pools
  pools: Pool[];
  poolsLoading?: boolean;
  selectedPools: Pool[];
  onSelectPools: (pools: Pool[]) => void;

  // Vouchers
  selectedTokens: Voucher[];
  allVouchers: Voucher[];
  onSelectTokens: (tokens: Voucher[]) => void;

  // Animation
  date: number;
  setDate: (date: number) => void;
  animate: boolean;
  setAnimate: (animate: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  dateRange: DateRange;
  timelineHistogram: TimelineBucket[];

  // Display
  graphType: "2D" | "3D";
  setGraphType: (type: "2D" | "3D") => void;
  showRecentOnly: boolean;
  setShowRecentOnly: (show: boolean) => void;
  showTimelineBar: boolean;
  setShowTimelineBar: (show: boolean) => void;
  showReports: boolean;
  setShowReports: (show: boolean) => void;

  // Physics
  physicsInputs: PhysicsInputs;
  setChargeStrengthInput: (value: number) => void;
  setLinkDistanceInput: (value: number) => void;
  setCenterGravityInput: (value: number) => void;
  resetPhysicsToDefaults: () => void;

  // Footer
  lastUpdate: number | undefined;
}

export function SettingsPanel({
  onClose,
  nodeCount,
  linkCount,
  voucherCount,
  expandedSections,
  toggleSection,
  pools,
  poolsLoading,
  selectedPools,
  onSelectPools,
  selectedTokens,
  allVouchers,
  onSelectTokens,
  date,
  setDate,
  animate,
  setAnimate,
  animationSpeed,
  setAnimationSpeed,
  dateRange,
  timelineHistogram,
  graphType,
  setGraphType,
  showRecentOnly,
  setShowRecentOnly,
  showTimelineBar,
  setShowTimelineBar,
  showReports,
  setShowReports,
  physicsInputs,
  setChargeStrengthInput,
  setLinkDistanceInput,
  setCenterGravityInput,
  resetPhysicsToDefaults,
  lastUpdate,
}: SettingsPanelProps) {
  return (
    <div className="w-full sm:w-[360px] z-20 absolute inset-0 sm:inset-auto sm:top-0 sm:right-0 bg-white sm:m-3 sm:rounded-lg shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600">
        <h1 className="text-white font-semibold text-lg">Settings</h1>
        <CloseIcon
          onClick={onClose}
          className="w-5 h-5 cursor-pointer text-white/70 hover:text-white transition-colors"
        />
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Stats Bar */}
        <StatsBar
          nodeCount={nodeCount}
          linkCount={linkCount}
          voucherCount={voucherCount}
        />

        {/* Animation Section */}
        <AnimationSection
          expanded={expandedSections.animation}
          onToggle={() => toggleSection("animation")}
          date={date}
          setDate={setDate}
          animate={animate}
          setAnimate={setAnimate}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          dateRange={dateRange}
          timelineHistogram={timelineHistogram}
        />

        {/* Pool Section */}
        <PoolSection
          expanded={expandedSections.pools}
          onToggle={() => toggleSection("pools")}
          pools={pools}
          selectedPools={selectedPools}
          onSelectPools={onSelectPools}
          isLoading={poolsLoading}
        />

        {/* Vouchers Section */}
        <VoucherSection
          expanded={expandedSections.vouchers}
          onToggle={() => toggleSection("vouchers")}
          selectedTokens={selectedTokens}
          allVouchers={allVouchers}
          onSelectTokens={onSelectTokens}
        />

        {/* Display Options Section */}
        <DisplaySection
          expanded={expandedSections.display}
          onToggle={() => toggleSection("display")}
          graphType={graphType}
          setGraphType={setGraphType}
          showRecentOnly={showRecentOnly}
          setShowRecentOnly={setShowRecentOnly}
          showTimelineBar={showTimelineBar}
          setShowTimelineBar={setShowTimelineBar}
          showReports={showReports}
          setShowReports={setShowReports}
        />

        {/* Physics Section */}
        <PhysicsSection
          expanded={expandedSections.physics}
          onToggle={() => toggleSection("physics")}
          inputs={physicsInputs}
          setChargeStrengthInput={setChargeStrengthInput}
          setLinkDistanceInput={setLinkDistanceInput}
          setCenterGravityInput={setCenterGravityInput}
          resetToDefaults={resetPhysicsToDefaults}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
        <p className="text-xs text-gray-400 text-center">
          Last updated:{" "}
          {lastUpdate
            ? new Date(lastUpdate).toLocaleString()
            : "Unknown"}
        </p>
      </div>
    </div>
  );
}
