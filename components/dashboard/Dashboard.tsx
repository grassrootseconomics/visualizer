/**
 * Main Dashboard component - orchestrates data fetching and child components
 */

import { add, isAfter } from "date-fns";
import React from "react";
import useSWR from "swr";

import { GearIcon, PauseIcon, PlayIcon } from "@components/icons";
import { NetworkGraph2d } from "@components/network-graph/network-graph-2d";
import { NetworkGraph3d } from "@components/network-graph/network-graph-3d";

import { FieldReportsOverlay } from "./FieldReportsOverlay";
import { InfoPanel, type SelectedInfo } from "./InfoPanel";
import type { TimelineBucket } from "./sections";
import { SettingsPanel, type ExpandedSections } from "./SettingsPanel";
import { TimelineBar } from "./TimelineBar";

import { useFieldReports } from "@/hooks/dashboard";
import type { DataResponse } from "@/pages/api/data";
import type { FieldReportsResponse } from "@/types";
import type { Voucher } from "@/types/voucher";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Pre-calculate 2-month duration in milliseconds (constant)
const TWO_MONTHS_MS = 2 * 30 * 24 * 60 * 60 * 1000;
const NUM_BUCKETS = 60;

const now = new Date();

export function Dashboard() {
  // Data fetching with SWR
  const { data, error, isLoading } = useSWR<DataResponse>(
    "/api/data",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  // Fetch field reports
  const { data: reportsData } = useSWR<FieldReportsResponse>(
    "/api/reports",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  // Panel states
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [graphType, setGraphType] = React.useState<"2D" | "3D">("3D");
  const [showTimelineBar, setShowTimelineBar] = React.useState(true);

  // Token filtering
  const [selectedTokens, setSelectedTokens] = React.useState<Voucher[]>([]);
  const [filteredByToken, setFilteredByToken] = React.useState<
    DataResponse["graphData"]
  >({
    nodes: [],
    links: [],
  });

  // Animation state
  const [animate, setAnimate] = React.useState(false);
  const [animationSpeed, setAnimationSpeed] = React.useState(24);
  const [date, setDate] = React.useState(now.getTime());

  // Display options
  const [showRecentOnly, setShowRecentOnly] = React.useState(true);
  const [showReports, setShowReports] = React.useState(false);

  // Physics settings - input values (immediate UI feedback)
  const [chargeStrengthInput, setChargeStrengthInput] = React.useState(-8);
  const [linkDistanceInput, setLinkDistanceInput] = React.useState(30);
  const [centerGravityInput, setCenterGravityInput] = React.useState(0.8);

  // Debounced physics values (applied to graph after delay)
  const [chargeStrength, setChargeStrength] = React.useState(-8);
  const [linkDistance, setLinkDistance] = React.useState(30);
  const [centerGravity, setCenterGravity] = React.useState(0.8);

  // Selected info panel
  const [selectedInfo, setSelectedInfo] = React.useState<SelectedInfo>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] =
    React.useState<ExpandedSections>({
      vouchers: true,
      animation: false,
      display: false,
      physics: false,
    });

  // Debounce physics updates
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setChargeStrength(chargeStrengthInput);
      setLinkDistance(linkDistanceInput);
      setCenterGravity(centerGravityInput);
    }, 150);
    return () => clearTimeout(timer);
  }, [chargeStrengthInput, linkDistanceInput, centerGravityInput]);

  // Initialize selected tokens when data loads
  React.useEffect(() => {
    if (data) {
      setSelectedTokens(data.vouchers);
      setFilteredByToken(data.graphData);
    }
  }, [data]);

  // Filter graph data by selected tokens
  React.useEffect(() => {
    if (!data) return;

    const newGraphData = {
      nodes: data.graphData.nodes.filter((node) =>
        selectedTokens.some((selectedToken) =>
          Object.keys(node.usedVouchers).includes(
            selectedToken.contract_address
          )
        )
      ),
      links: data.graphData.links.filter((link) =>
        selectedTokens.some(
          (selectedToken) =>
            selectedToken.contract_address === link.contract_address
        )
      ),
    };
    setFilteredByToken(newGraphData);
  }, [data, selectedTokens]);

  // Derive dateRange from filtered links
  const dateRange = React.useMemo(() => {
    if (!filteredByToken.links.length) {
      return { start: now.getTime(), end: now.getTime() };
    }
    let start = Infinity;
    let end = 0;
    for (const link of filteredByToken.links) {
      if (link.date < start) start = link.date;
      if (link.date > end) end = link.date;
    }
    return { start, end };
  }, [filteredByToken.links]);

  // Initialize date to end of range when data loads (show most recent state)
  React.useEffect(() => {
    if (dateRange.end > 0 && dateRange.end !== dateRange.start) {
      setDate(dateRange.end);
    }
  }, [dateRange.end]);

  // Timeline histogram
  const timelineHistogram = React.useMemo<TimelineBucket[]>(() => {
    const { start, end } = dateRange;
    const range = end - start;
    if (range <= 0) return [];

    const bucketSize = range / NUM_BUCKETS;
    const buckets = new Array(NUM_BUCKETS).fill(0);

    for (const link of filteredByToken.links) {
      const bucketIndex = Math.min(
        Math.floor((link.date - start) / bucketSize),
        NUM_BUCKETS - 1
      );
      if (bucketIndex >= 0) {
        buckets[bucketIndex] += link.txCount || 1;
      }
    }

    const maxCount = Math.max(...buckets, 1);

    return buckets.map((count, i) => ({
      count,
      normalized: count / maxCount,
      startTime: start + i * bucketSize,
      endTime: start + (i + 1) * bucketSize,
    }));
  }, [dateRange, filteredByToken.links]);

  // Animation loop
  React.useEffect(() => {
    if (!animate) return;

    const intervalId = setInterval(() => {
      setDate((prevDate) => {
        const nextDate = add(prevDate, { hours: animationSpeed }).getTime();
        // If next step would go past end, pause at end
        if (isAfter(nextDate, dateRange.end)) {
          setAnimate(false);
          return dateRange.end;
        }
        return nextDate;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [animate, animationSpeed, dateRange.end]);

  // Spacebar to toggle play/pause
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        setAnimate((prev) => {
          if (!prev && date >= dateRange.end) {
            // If starting from end, reset to beginning first
            setDate(dateRange.start);
          }
          return !prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [date, dateRange.start, dateRange.end]);

  // Memoize available node IDs
  const availableNodeIds = React.useMemo(
    () => new Set(filteredByToken.nodes.map((n) => n.id)),
    [filteredByToken.nodes]
  );

  // Final filtered graph data
  const graphData = React.useMemo(() => {
    const currentTime = date;
    const recencyCutoff = showRecentOnly ? currentTime - TWO_MONTHS_MS : 0;

    const activeLinks = filteredByToken.links.filter((link) => {
      if (link.date > currentTime) return false;
      if (link.date < recencyCutoff) return false;
      return (
        availableNodeIds.has(link.source) && availableNodeIds.has(link.target)
      );
    });

    const activeAddresses = new Set<string>();
    activeLinks.forEach((link) => {
      activeAddresses.add(link.source);
      activeAddresses.add(link.target);
    });

    const filteredNodes = filteredByToken.nodes.filter((node) =>
      activeAddresses.has(node.id)
    );

    return {
      nodes: filteredNodes,
      links: activeLinks,
    };
  }, [
    filteredByToken.links,
    filteredByToken.nodes,
    availableNodeIds,
    date,
    showRecentOnly,
  ]);

  // Selected voucher addresses for filtering
  const selectedVoucherAddresses = React.useMemo(
    () => new Set(selectedTokens.map((t) => t.contract_address)),
    [selectedTokens]
  );

  // Field reports filtering
  const { visibleReports, dismissReport, resetDismissed } = useFieldReports({
    reports: reportsData?.reports ?? [],
    currentDate: date,
    selectedVoucherAddresses,
    maxVisible: 3,
  });

  // Reset dismissed reports when animation restarts from beginning
  React.useEffect(() => {
    if (date === dateRange.start) {
      resetDismissed();
    }
  }, [date, dateRange.start, resetDismissed]);

  // Callbacks
  const toggleSection = React.useCallback((section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleNodeClick = React.useCallback((node: any) => {
    setSelectedInfo({
      type: "node",
      data: {
        id: node.id,
        value: node.value,
        usedVouchers: node.usedVouchers,
      },
    });
  }, []);

  const handleLinkClick = React.useCallback((link: any) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;
    setSelectedInfo({
      type: "link",
      data: {
        source: sourceId,
        target: targetId,
        token_name: link.token_name,
        token_symbol: link.token_symbol,
        contract_address: link.contract_address,
        txCount: link.txCount || 1,
        value: link.value || 0,
        date: link.date,
        dateFirst: link.dateFirst,
      },
    });
  }, []);

  const copyToClipboard = React.useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const resetPhysicsToDefaults = React.useCallback(() => {
    setChargeStrengthInput(-8);
    setLinkDistanceInput(30);
    setCenterGravityInput(0.8);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-screen h-[100vh] flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading graph data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-screen h-[100vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">Error loading data</div>
          <div className="text-gray-600">
            {error.message || "Failed to load graph data"}
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="w-screen h-[100vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-[100vh] overflow-hidden my-auto">
      {/* Top controls */}
      <div
        className={`justify-center items-center absolute gap-4 md:gap-0 right-0 flex z-20 transition-all ${
          showTimelineBar ? "top-2" : "bottom-0"
        }`}
      >
        {animate ? (
          <PauseIcon onClick={() => setAnimate(false)} />
        ) : (
          <PlayIcon
            onClick={() => {
              // If at or past end, reset to start before playing
              if (date >= dateRange.end) {
                setDate(dateRange.start);
              }
              setAnimate(true);
            }}
          />
        )}
        <GearIcon onClick={() => setOptionsOpen((prev) => !prev)} />
      </div>

      {/* Settings Panel */}
      {optionsOpen && (
        <SettingsPanel
          onClose={() => setOptionsOpen(false)}
          nodeCount={graphData.nodes.length}
          linkCount={graphData.links.length}
          voucherCount={selectedTokens.length}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          selectedTokens={selectedTokens}
          allVouchers={data.vouchers}
          onSelectTokens={setSelectedTokens}
          date={date}
          setDate={setDate}
          animate={animate}
          setAnimate={setAnimate}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          dateRange={dateRange}
          timelineHistogram={timelineHistogram}
          graphType={graphType}
          setGraphType={setGraphType}
          showRecentOnly={showRecentOnly}
          setShowRecentOnly={setShowRecentOnly}
          showTimelineBar={showTimelineBar}
          setShowTimelineBar={setShowTimelineBar}
          showReports={showReports}
          setShowReports={setShowReports}
          physicsInputs={{
            chargeStrengthInput,
            linkDistanceInput,
            centerGravityInput,
          }}
          setChargeStrengthInput={setChargeStrengthInput}
          setLinkDistanceInput={setLinkDistanceInput}
          setCenterGravityInput={setCenterGravityInput}
          resetPhysicsToDefaults={resetPhysicsToDefaults}
          lastUpdate={data.lastUpdate}
        />
      )}

      {/* Graph */}
      {graphData && graphType === "2D" ? (
        <NetworkGraph2d
          animate={animate}
          graphData={graphData}
          chargeStrength={chargeStrength}
          linkDistance={linkDistance}
          centerGravity={centerGravity}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
        />
      ) : (
        <NetworkGraph3d
          animate={animate}
          graphData={graphData}
          chargeStrength={chargeStrength}
          linkDistance={linkDistance}
          centerGravity={centerGravity}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
        />
      )}

      {/* Field Reports Overlay */}
      {showReports && (
        <FieldReportsOverlay
          visibleReports={visibleReports}
          onDismiss={dismissReport}
        />
      )}

      {/* Bottom Timeline Bar */}
      {showTimelineBar && (
        <TimelineBar
          date={date}
          setDate={setDate}
          dateRange={dateRange}
          timelineHistogram={timelineHistogram}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
        />
      )}

      {/* Info Panel */}
      <InfoPanel
        selectedInfo={selectedInfo}
        onClose={() => setSelectedInfo(null)}
        vouchers={data?.vouchers}
        copiedField={copiedField}
        copyToClipboard={copyToClipboard}
      />
    </div>
  );
}
