import {
  ChevronDownIcon,
  CloseIcon,
  GearIcon,
  PauseIcon,
  PlayIcon,
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

  React.useEffect(() => {
    if (animate) {
      setDate(dateRange.start);
      const intervalId = setInterval(() => {
        setDate((prevDate) => {
          const nextDate = add(prevDate, { hours: animationSpeed }).getTime();
          // Auto-stop when reaching end
          if (isAfter(nextDate, dateRange.end)) {
            setAnimate(false);
            return prevDate;
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
  }, [filteredByToken.links, filteredByToken.nodes, availableNodeIds, date, showRecentOnly]);

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
          <div className="text-gray-500">
            Graph data not found. Please run the cron job first.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-screen h-[100vh] overflow-hidden my-auto">
      <div className="justify-center items-center absolute bottom-0 right-0 flex">
        {animate ? (
          <PauseIcon onClick={() => setAnimate(false)} />
        ) : (
          <PlayIcon onClick={() => setAnimate(true)} />
        )}
        <GearIcon onClick={() => setOptionsOpen((prev) => !prev)} />
      </div>

      {optionsOpen && (
        <div className="w-full sm:w-[360px] z-10 absolute inset-0 sm:inset-auto sm:top-0 sm:right-0 bg-white sm:m-3 sm:rounded-lg shadow-xl overflow-hidden flex flex-col">
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                    <button
                      className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md font-medium transition-colors ${
                        animate
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                      onClick={() => setAnimate((prev) => !prev)}
                    >
                      {animate ? "Stop" : "Play"}
                    </button>
                    <span className="text-sm font-medium text-gray-700 text-center sm:text-right">
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
                    <input
                      min={dateRange.start}
                      max={dateRange.end}
                      onChange={(e) => setDate(parseInt(e.target.value))}
                      type="range"
                      value={date}
                      className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
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
        />
      ) : (
        <NetworkGraph3d
          animate={animate}
          graphData={graphData}
          chargeStrength={chargeStrength}
          linkDistance={linkDistance}
          centerGravity={centerGravity}
        />
      )}
    </div>
  );
}

export default Dashboard;
