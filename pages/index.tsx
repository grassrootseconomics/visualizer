import {
  ChevronDownIcon,
  CloseIcon,
  CopyIcon,
  ExternalLinkIcon,
  GearIcon,
  PauseIcon,
  PauseIconSmall,
  PlayIcon,
  PlayIconSmall,
  ResetIcon,
} from "@components/icons";
import { NetworkGraph2d } from "@components/network-graph/network-graph-2d";
import { NetworkGraph3d } from "@components/network-graph/network-graph-3d";
import { MultiSelect } from "@components/select";
import { add, isAfter } from "date-fns";
import React from "react";
import useSWR from "swr";
import { DataResponse } from "./api/data";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const now = new Date();

function Dashboard() {
  // Use SWR to fetch data from our API
  const { data, error, isLoading } = useSWR<DataResponse>(
    "/api/data",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );

  const [selectedTokens, setSelectedTokens] = React.useState<
    DataResponse["vouchers"]
  >([]);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [filteredByToken, setFilteredByToken] = React.useState<
    DataResponse["graphData"]
  >({
    nodes: [],
    links: [],
  });
  const [graphType, setGraphType] = React.useState<"2D" | "3D">("3D");

  const [animate, setAnimate] = React.useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = React.useState(24); // hours per second
  const [date, setDate] = React.useState(now.getTime());

  // Graph physics settings - input values (immediate UI feedback)
  // Defaults optimized for large graphs (1000+ nodes)
  const [chargeStrengthInput, setChargeStrengthInput] = React.useState(-8);
  const [linkDistanceInput, setLinkDistanceInput] = React.useState(30);
  const [centerGravityInput, setCenterGravityInput] = React.useState(0.8);

  // Debounced physics values (applied to graph after delay)
  const [chargeStrength, setChargeStrength] = React.useState(-8);
  const [linkDistance, setLinkDistance] = React.useState(30);
  const [centerGravity, setCenterGravity] = React.useState(0.8);

  // Debounce physics updates to prevent simulation reheat spam
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setChargeStrength(chargeStrengthInput);
      setLinkDistance(linkDistanceInput);
      setCenterGravity(centerGravityInput);
    }, 150);
    return () => clearTimeout(timer);
  }, [chargeStrengthInput, linkDistanceInput, centerGravityInput]);

  // Filter to show only recently active nodes/links (within last 2 months)
  const [showRecentOnly, setShowRecentOnly] = React.useState(true);

  // Show/hide bottom timeline bar
  const [showTimelineBar, setShowTimelineBar] = React.useState(true);

  // Selected node/link info panel
  type SelectedInfo =
    | { type: "node"; data: { id: string; value: number; usedVouchers: Record<string, { firstTxDate: number; txCount: number }> } }
    | { type: "link"; data: { source: string; target: string; token_name: string; token_symbol: string; contract_address: string; txCount: number; value: number; date: number; dateFirst: number } }
    | null;
  const [selectedInfo, setSelectedInfo] = React.useState<SelectedInfo>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = React.useState({
    vouchers: true,
    animation: false,
    display: false,
    physics: false,
  });

  const toggleSection = React.useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    },
    []
  );

  // Handle node click - show info panel
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

  // Handle link click - show info panel
  const handleLinkClick = React.useCallback((link: any) => {
    const sourceId = typeof link.source === "object" ? link.source.id : link.source;
    const targetId = typeof link.target === "object" ? link.target.id : link.target;
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

  // Copy to clipboard helper
  const copyToClipboard = React.useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // Update state when data is loaded
  React.useEffect(() => {
    if (data) {
      setSelectedTokens(data.vouchers);
      setFilteredByToken(data.graphData);
    }
  }, [data]);

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

  // Derive dateRange from filtered links (avoids redundant state)
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

  // Timeline histogram: transaction counts per time bucket
  const NUM_BUCKETS = 60;
  const timelineHistogram = React.useMemo(() => {
    const { start, end } = dateRange;
    const range = end - start;
    if (range <= 0) return [];

    const bucketSize = range / NUM_BUCKETS;
    const buckets = new Array(NUM_BUCKETS).fill(0);

    // Count transactions (using txCount for aggregated links)
    for (const link of filteredByToken.links) {
      const bucketIndex = Math.min(
        Math.floor((link.date - start) / bucketSize),
        NUM_BUCKETS - 1
      );
      if (bucketIndex >= 0) {
        buckets[bucketIndex] += link.txCount || 1;
      }
    }

    // Find max for normalization
    const maxCount = Math.max(...buckets, 1);

    return buckets.map((count, i) => ({
      count,
      normalized: count / maxCount,
      startTime: start + i * bucketSize,
      endTime: start + (i + 1) * bucketSize,
    }));
  }, [dateRange, filteredByToken.links]);

  React.useEffect(() => {
    if (animate) {
      const intervalId = setInterval(() => {
        setDate((prevDate) => {
          const nextDate = add(prevDate, { hours: animationSpeed }).getTime();
          // Auto-stop and reset when reaching end
          if (isAfter(nextDate, dateRange.end)) {
            setAnimate(false);
            return dateRange.start;
          }
          return nextDate;
        });
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [animate, animationSpeed, dateRange.start, dateRange.end]);

  // Memoize available node IDs separately (only changes with token filter)
  const availableNodeIds = React.useMemo(
    () => new Set(filteredByToken.nodes.map((n) => n.id)),
    [filteredByToken.nodes]
  );

  // Pre-calculate 2-month duration in milliseconds (constant)
  const TWO_MONTHS_MS = 2 * 30 * 24 * 60 * 60 * 1000;

  const graphData = React.useMemo(() => {
    const currentTime = date;

    // Calculate the recency cutoff (2 months before the reference date)
    // Use numeric comparison instead of Date objects for performance
    const recencyCutoff = showRecentOnly ? currentTime - TWO_MONTHS_MS : 0;

    // Filter links: must be in date range AND both source/target must exist
    // When showRecentOnly is enabled, also filter out links older than 2 months
    // Using numeric comparisons instead of Date objects
    const activeLinks = filteredByToken.links.filter((link) => {
      // Short-circuit: check cheapest conditions first
      if (link.date > currentTime) return false;
      if (link.date < recencyCutoff) return false;
      return (
        availableNodeIds.has(link.source) && availableNodeIds.has(link.target)
      );
    });

    // Get all addresses that have been active in transactions
    const activeAddresses = new Set<string>();
    activeLinks.forEach((link) => {
      activeAddresses.add(link.source);
      activeAddresses.add(link.target);
    });

    // Filter nodes - graph component handles positions
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-screen h-[100vh] flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading graph data...</div>
      </div>
    );
  }

  // Show error state
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

  // Show message if no data
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
      <div
        className={`justify-center items-center absolute gap-4 md:gap-0 right-0 flex z-20 transition-all ${
          showTimelineBar ? "top-2" : "bottom-0"
        }`}
      >
        {animate ? (
          <PauseIcon onClick={() => setAnimate(false)} />
        ) : (
          <PlayIcon onClick={() => setAnimate(true)} />
        )}
        <GearIcon onClick={() => setOptionsOpen((prev) => !prev)} />
      </div>

      {optionsOpen && (
        <div className="w-full sm:w-[360px] z-20 absolute inset-0 sm:inset-auto sm:top-0 sm:right-0 bg-white sm:m-3 sm:rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600">
            <h1 className="text-white font-semibold text-lg">Settings</h1>
            <CloseIcon
              onClick={() => setOptionsOpen(false)}
              className="w-5 h-5 cursor-pointer text-white/70 hover:text-white transition-colors"
            />
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {graphData.nodes.length}
                </p>
                <p className="text-xs text-gray-500">Nodes</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-emerald-600">
                  {graphData.links.length}
                </p>
                <p className="text-xs text-gray-500">Links</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-teal-600">
                  {selectedTokens.length}
                </p>
                <p className="text-xs text-gray-500">Vouchers</p>
              </div>
            </div>

            {/* Vouchers Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("vouchers")}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700">
                  Filter Vouchers
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    expandedSections.vouchers ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.vouchers && (
                <div className="p-3 sm:p-4 space-y-3">
                  <MultiSelect
                    selected={selectedTokens}
                    options={data.vouchers}
                    label="Select Vouchers"
                    optionToKey={(o: any) => o.contract_address}
                    optionToLabel={(o: any) =>
                      `${o.token_name} (${o.token_symbol})`
                    }
                    optionToSearchFields={(o: any) => [
                      o.token_name,
                      o.token_symbol,
                    ]}
                    prioritizeSymbol="cUSD"
                    onChange={(c) => setSelectedTokens(c)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-green-600 border border-green-200 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors"
                      onClick={() => setSelectedTokens(data.vouchers)}
                    >
                      Select All
                    </button>
                    <button
                      className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      onClick={() => setSelectedTokens([])}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Animation Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("animation")}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700">
                  Timeline Animation
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    expandedSections.animation ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.animation && (
                <div className="p-3 sm:p-4 space-y-4">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex gap-1">
                      <button
                        className={`p-2.5 rounded-md transition-colors ${
                          animate
                            ? "text-amber-500 hover:text-amber-600 bg-none"
                            : "text-green-500 hover:text-green-600 bg-none"
                        }`}
                        onClick={() => setAnimate((prev) => !prev)}
                        title={animate ? "Pause" : "Play"}
                      >
                        {animate ? (
                          <PauseIconSmall className="w-5 h-5" />
                        ) : (
                          <PlayIconSmall className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        className="p-2.5 rounded-md transition-colors text-gray-300 hover:text-gray-400 "
                        onClick={() => {
                          setAnimate(false);
                          setDate(dateRange.start);
                        }}
                        title="Reset"
                      >
                        <ResetIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                      <label className="text-xs text-gray-500">Timeline</label>
                      <span className="text-xs text-gray-400">
                        {new Date(dateRange.start).toLocaleDateString()} -{" "}
                        {new Date(dateRange.end).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Timeline Histogram */}
                    {timelineHistogram.length > 0 && (
                      <div className="relative h-12 mb-1 flex items-end gap-px rounded overflow-hidden bg-none">
                        {timelineHistogram.map((bucket, i) => {
                          const isPast = bucket.endTime <= date;
                          const isCurrent =
                            bucket.startTime <= date && bucket.endTime > date;
                          return (
                            <div
                              key={i}
                              className="flex-1 transition-all duration-150"
                              style={{
                                height: `${Math.max(
                                  bucket.normalized * 100,
                                  2
                                )}%`,
                                backgroundColor: isCurrent
                                  ? "#10b981" // emerald-500
                                  : isPast
                                  ? "#6ee7b7" // emerald-300
                                  : "#d1d5db", // gray-300
                              }}
                              title={`${bucket.count} transactions`}
                            />
                          );
                        })}
                        {/* Current position indicator */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 pointer-events-none"
                          style={{
                            left: `${
                              ((date - dateRange.start) /
                                (dateRange.end - dateRange.start)) *
                              100
                            }%`,
                          }}
                        />
                        <input
                          min={dateRange.start}
                          max={dateRange.end}
                          onChange={(e) => setDate(parseInt(e.target.value))}
                          type="range"
                          value={date}
                          className="absolute top-0 left-[-8px] right-[-10px] bottom-0 bg-transparent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none
         [&::-webkit-slider-thumb]:h-5
         [&::-webkit-slider-thumb]:w-5
         [&::-webkit-slider-thumb]:rounded-full
         [&::-webkit-slider-thumb]:bg-transparent
         [&::-moz-range-thumb]:appearance-none
         [&::-moz-range-thumb]:h-5
         [&::-moz-range-thumb]:w-5
         [&::-moz-range-thumb]:rounded-full
         [&::-moz-range-thumb]:bg-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">
                        Animation Speed
                      </label>
                      <span className="text-xs text-gray-700 font-medium">
                        {animationSpeed}h/sec
                      </span>
                    </div>
                    <input
                      min={1}
                      max={168}
                      onChange={(e) =>
                        setAnimationSpeed(parseInt(e.target.value))
                      }
                      type="range"
                      value={animationSpeed}
                      className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1h</span>
                      <span>1 day</span>
                      <span>1 week</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Display Options Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("display")}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700">
                  Display Options
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    expandedSections.display ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.display && (
                <div className="p-3 sm:p-4 space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">
                      Graph View
                    </label>
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 px-4 py-2.5 sm:py-2 rounded-md font-medium transition-colors ${
                          graphType === "2D"
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setGraphType("2D")}
                      >
                        2D View
                      </button>
                      <button
                        className={`flex-1 px-4 py-2.5 sm:py-2 rounded-md font-medium transition-colors ${
                          graphType === "3D"
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setGraphType("3D")}
                      >
                        3D View
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showRecentOnly}
                        onChange={(e) => setShowRecentOnly(e.target.checked)}
                        className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-sm text-gray-700 font-medium">
                          Show recent activity only
                        </span>
                        <p className="text-xs text-gray-500">
                          Only show nodes and links active in the last 2 months
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTimelineBar}
                        onChange={(e) => setShowTimelineBar(e.target.checked)}
                        className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-sm text-gray-700 font-medium">
                          Show timeline bar
                        </span>
                        <p className="text-xs text-gray-500">
                          Display timeline controls at the bottom of the screen
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Physics Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("physics")}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700">Graph Physics</span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    expandedSections.physics ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.physics && (
                <div className="p-3 sm:p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">
                        Charge Strength
                      </label>
                      <span className="text-xs text-gray-700 font-medium">
                        {chargeStrengthInput}
                      </span>
                    </div>
                    <input
                      min={-100}
                      max={0}
                      onChange={(e) =>
                        setChargeStrengthInput(parseInt(e.target.value))
                      }
                      type="range"
                      value={chargeStrengthInput}
                      className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Repel</span>
                      <span>Neutral</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">
                        Link Distance
                      </label>
                      <span className="text-xs text-gray-700 font-medium">
                        {linkDistanceInput}px
                      </span>
                    </div>
                    <input
                      min={5}
                      max={100}
                      onChange={(e) =>
                        setLinkDistanceInput(parseInt(e.target.value))
                      }
                      type="range"
                      value={linkDistanceInput}
                      className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Close</span>
                      <span>Far</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">
                        Center Gravity
                      </label>
                      <span className="text-xs text-gray-700 font-medium">
                        {centerGravityInput}
                      </span>
                    </div>
                    <input
                      min={0}
                      max={5}
                      step={0.1}
                      onChange={(e) =>
                        setCenterGravityInput(parseFloat(e.target.value))
                      }
                      type="range"
                      value={centerGravityInput}
                      className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>None</span>
                      <span>Strong</span>
                    </div>
                  </div>

                  <button
                    className="w-full px-3 py-2 sm:py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    onClick={() => {
                      setChargeStrengthInput(-8);
                      setLinkDistanceInput(30);
                      setCenterGravityInput(0.8);
                    }}
                  >
                    Reset to Defaults
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
            <p className="text-xs text-gray-400 text-center">
              Last updated:{" "}
              {data.lastUpdate
                ? new Date(data.lastUpdate).toLocaleString()
                : "Unknown"}
            </p>
          </div>
        </div>
      )}
      {graphData && graphType == "2D" ? (
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

      {/* Bottom Timeline Bar */}
      {showTimelineBar && timelineHistogram.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-none ">
          <div className="px-3 sm:px-4 py-2 sm:py-0">
            <div className="flex items-center gap-2 sm:gap-4 mx-auto">
              {/* Timeline with Histogram */}
              <div className="flex-1 min-w-0">
                {/* Date labels */}
                <div className="flex justify-between text-xs text-gray-400 mb-1 px-0.5">
                  <span className="hidden sm:inline">
                    {new Date(dateRange.start).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-gray-200">
                    {new Date(date).toLocaleDateString()}
                  </span>
                  <span className="hidden sm:inline">
                    {new Date(dateRange.end).toLocaleDateString()}
                  </span>
                </div>

                {/* Histogram */}
                <div className="relative h-8 sm:h-10 flex items-end gap-px rounded overflow-hidden bg-none">
                  {timelineHistogram.map((bucket, i) => {
                    const isPast = bucket.endTime <= date;
                    const isCurrent =
                      bucket.startTime <= date && bucket.endTime > date;
                    return (
                      <div
                        key={i}
                        className="flex-1 transition-all duration-150 cursor-pointer hover:opacity-80"
                        style={{
                          height: `${Math.max(bucket.normalized * 100, 2)}%`,
                          backgroundColor: isCurrent
                            ? "#10b981"
                            : isPast
                            ? "#6ee7b7"
                            : "#d1d5db",
                        }}
                        title={`${bucket.count} transactions`}
                        onClick={() => setDate(bucket.startTime)}
                      />
                    );
                  })}
                  {/* Current position indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 pointer-events-none"
                    style={{
                      left: `${
                        ((date - dateRange.start) /
                          (dateRange.end - dateRange.start)) *
                        100
                      }%`,
                    }}
                  />
                  {/* Slider */}
                  <input
                    min={dateRange.start}
                    max={dateRange.end}
                    onChange={(e) => setDate(parseInt(e.target.value))}
                    type="range"
                    value={date}
                    className="absolute top-0 left-[-8px] right-[-10px] bottom-0 bg-transparent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none
         [&::-webkit-slider-thumb]:h-5
         [&::-webkit-slider-thumb]:w-5
         [&::-webkit-slider-thumb]:rounded-full
         [&::-webkit-slider-thumb]:bg-transparent
         [&::-moz-range-thumb]:appearance-none
         [&::-moz-range-thumb]:h-5
         [&::-moz-range-thumb]:w-5
         [&::-moz-range-thumb]:rounded-full
         [&::-moz-range-thumb]:bg-transparent"
                  />
                </div>
              </div>

              {/* Speed Control (hidden on very small screens) */}
              <div className="hidden md:flex flex-col items-start mx-8 gap-2 flex-shrink-0">
                <label className="text-xs text-gray-400 whitespace-nowrap">
                  Speed
                </label>
                <input
                  min={1}
                  max={168}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  type="range"
                  value={animationSpeed}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <span className="text-xs text-gray-400 font-medium w-12">
                  {animationSpeed}h/s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {selectedInfo && (
        <div className="absolute top-4 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600">
            <h2 className="text-white font-semibold">
              {selectedInfo.type === "node" ? "Account" : "Transaction"}
            </h2>
            <CloseIcon
              onClick={() => setSelectedInfo(null)}
              className="w-5 h-5 cursor-pointer text-white/70 hover:text-white transition-colors"
            />
          </div>

          <div className="p-4 space-y-3">
            {selectedInfo.type === "node" ? (
              <>
                {/* Node Address */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-gray-100 text-gray-500 px-2 py-1.5 rounded font-mono truncate">
                      {selectedInfo.data.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedInfo.data.id, "address")}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Copy address"
                    >
                      <CopyIcon className={`w-4 h-4 ${copiedField === "address" ? "text-green-500" : "text-gray-500"}`} />
                    </button>
                  </div>
                </div>

                {/* Transaction count */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Total Transactions</label>
                  <p className="text-sm font-medium text-gray-700">{selectedInfo.data.value}</p>
                </div>

                {/* Vouchers used with details */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Vouchers Used ({Object.keys(selectedInfo.data.usedVouchers).length})
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {Object.entries(selectedInfo.data.usedVouchers)
                      .sort(([, a], [, b]) => b.txCount - a.txCount)
                      .map(([contractAddress, { firstTxDate, txCount }]) => {
                        const voucher = data?.vouchers.find(
                          (v) => v.contract_address === contractAddress
                        );
                        return (
                          <div
                            key={contractAddress}
                            className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1.5 rounded"
                          >
                            <span className="text-gray-700 truncate flex-1">
                              {voucher
                                ? `${voucher.token_name} (${voucher.token_symbol})`
                                : contractAddress.slice(0, 10) + "..."}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-xs font-medium text-emerald-600 whitespace-nowrap">
                                {txCount} tx
                              </span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(firstTxDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* External link */}
                <a
                  href={`https://celoscan.io/address/${selectedInfo.data.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors text-sm font-medium"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  View on Celoscan
                </a>
              </>
            ) : (
              <>
                {/* Token info */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Token</label>
                  <p className="text-sm font-medium text-gray-700">
                    {selectedInfo.data.token_name} ({selectedInfo.data.token_symbol})
                  </p>
                </div>

                {/* Contract address */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Contract</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-gray-500 px-2 py-1.5 rounded font-mono truncate">
                      {selectedInfo.data.contract_address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedInfo.data.contract_address, "contract")}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Copy contract"
                    >
                      <CopyIcon className={`w-4 h-4 ${copiedField === "contract" ? "text-green-500" : "text-gray-500"}`} />
                    </button>
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">From</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-gray-500 px-2 py-1 rounded font-mono truncate">
                      {selectedInfo.data.source}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedInfo.data.source, "source")}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy source"
                    >
                      <CopyIcon className={`w-3 h-3 ${copiedField === "source" ? "text-green-500" : "text-gray-500"}`} />
                    </button>
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">To</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-gray-500 px-2 py-1 rounded font-mono truncate">
                      {selectedInfo.data.target}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedInfo.data.target, "target")}
                      className="p-1 hover:bg-gray-100  rounded transition-colors"
                      title="Copy target"
                    >
                      <CopyIcon className={`w-3 h-3 ${copiedField === "target" ? "text-green-500" : "text-gray-500"}`} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Transactions</label>
                    <p className="text-sm font-medium text-gray-700">{selectedInfo.data.txCount}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Total Value</label>
                    <p className="text-sm font-medium text-gray-700">
                      {selectedInfo.data.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Date range */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Activity Period</label>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedInfo.data.dateFirst).toLocaleDateString()} - {new Date(selectedInfo.data.date).toLocaleDateString()}
                  </p>
                </div>

                {/* External link */}
                <a
                  href={`https://sarafu.network/vouchers/${selectedInfo.data.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors text-sm font-medium"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  View on Sarafu Network
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
