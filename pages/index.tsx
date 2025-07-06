import { NetworkGraph2d } from "@components/network-graph/network-graph-2d";
import { NetworkGraph3d } from "@components/network-graph/network-graph-3d";
import { MultiSelect } from "@components/select";
import { add, isAfter, isBefore } from "date-fns";
import React from "react";
import useSWR from "swr";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GraphData {
  graphData: any;
  vouchers: any[];
  lastUpdate: number;
}
const now = new Date();

const PlayIcon = ({ onClick }) => {
  return (
    <svg
      className="w-8 h-8 p-2 z-10 cursor-pointer"
      viewBox="0 0 60 60"
      onClick={onClick}
      stroke="white"
      fill="white"
    >
      <polygon points="0,0 50,30 0,60" />
    </svg>
  );
};
const PauseIcon = ({ onClick }) => {
  return (
    <svg
      className="w-8 h-8 p-2 center z-10 cursor-pointer"
      viewBox="0 0 60 60"
      stroke="white"
      fill="white"
      onClick={onClick}
    >
      <polygon points="0,0 15,0 15,60 0,60" />
      <polygon points="25,0 40,0 40,60 25,60" />
    </svg>
  );
};
function GearIcon(props: { onClick: () => void }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="w-10 h-10 p-2 z-10 cursor-pointer"
      onClick={() => props.onClick()}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function Dashboard() {
  // Use SWR to fetch data from our API
  const { data, error, isLoading } = useSWR<GraphData>(
    "/api/graph-data",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );

  const [selectedTokens, setSelectedTokens] = React.useState<any[]>([]);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [filteredByToken, setFilteredByToken] = React.useState<any>({
    nodes: [],
    links: [],
  });
  const [graphType, setGraphType] = React.useState<"2D" | "3D">("3D");

  const [animate, setAnimate] = React.useState<Boolean>(false);
  const [date, setDate] = React.useState(now.getTime());

  const [dateRange, setDateRage] = React.useState({
    start: date,
    end: date,
  });

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
      nodes: data.graphData.nodes.filter((node: any) =>
        selectedTokens.some((selectedToken) =>
          Object.keys(node.usedVouchers).includes(selectedToken.voucher_address)
        )
      ),
      links: data.graphData.links.filter((link: any) =>
        selectedTokens.some(
          (selectedToken) =>
            selectedToken.voucher_address === link.voucher_address
        )
      ),
    };
    setDateRage({
      start: newGraphData.links.reduce(
        (acc: number, e: any) => Math.min(acc, e.date),
        date
      ),
      end: newGraphData.links.reduce(
        (acc: number, e: any) => Math.max(acc, e.date),
        date
      ),
    });
    setFilteredByToken(newGraphData);
  }, [date, data, selectedTokens]);

  React.useEffect(() => {
    if (animate) {
      setDate(dateRange.start);
      const intervalId = setInterval(() => {
        setDate((prevDate) => {
          return add(prevDate, { hours: 4 }).getTime();
        });
      }, 250);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [animate]);

  const graphData = React.useMemo(() => {
    return {
      nodes: filteredByToken.nodes.filter((node: any) => {
        const firstSeen = Object.entries(node.usedVouchers).reduce(
          (d: number, v: [string, any]) => {
            if (
              selectedTokens.findIndex((t) => t.voucher_address == v[0]) !=
                -1 &&
              isBefore(new Date(v[1] as number), new Date(d))
            ) {
              return v[1] as number;
            }
            return d;
          },
          Date.now()
        );
        return isBefore(new Date(firstSeen), new Date(date));
      }),
      links: filteredByToken.links.filter((link: any) => {
        return isBefore(new Date(link.date), new Date(date));
      }),
    };
  }, [filteredByToken.nodes, filteredByToken.links, date, selectedTokens]);

  if (isAfter(date, dateRange.end) && animate) {
    setAnimate(false);
  }

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
        <GearIcon onClick={() => setOptionsOpen((prev) => !prev)}></GearIcon>
      </div>

      {optionsOpen && (
        <div className="min-w-[400px] z-10 absolute top-0 right-0 bg-white m-3 rounded-md  shadow-lg flex-col justify-center align-middle p-3">
          <h1 className="text-black text-center">Settings</h1>
          <label
            htmlFor="vouchers"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
          >
            Filter Vouchers
          </label>

          <MultiSelect
            selected={selectedTokens}
            options={data.vouchers}
            label="Select Vouchers"
            optionToKey={(o: any) => o.voucher_address}
            optionToLabel={(o: any) => o.voucher_name}
            onChange={(c) => setSelectedTokens(c)}
          />
          <div className="pt-2 flex justify-around">
            <button
              className="text-gray-800"
              onClick={() => setSelectedTokens(data.vouchers)}
            >
              Select All
            </button>
            <button
              className="text-gray-800"
              onClick={() => setSelectedTokens([])}
            >
              Clear
            </button>
          </div>
          <br />
          <label
            htmlFor="animate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
          >
            Animate
          </label>
          <div className="flex justify-around">
            <button className="btn" onClick={() => setAnimate((prev) => !prev)}>
              {animate ? "Stop Animation" : "Start Animation"}
            </button>
            <p className="text-gray-900">
              {new Date(date).toLocaleDateString()}
            </p>
          </div>
          <input
            min={dateRange.start}
            max={dateRange.end}
            onChange={(e) => {
              setDate(parseInt(e.target.value));
            }}
            id="default-range"
            type="range"
            value={date}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <br />
          <label
            htmlFor="view"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
          >
            View
          </label>
          <div className="flex justify-around">
            <button
              className="btn"
              disabled={graphType == "2D"}
              onClick={() => setGraphType("2D")}
            >
              2D
            </button>
            <button
              className="btn"
              disabled={graphType == "3D"}
              onClick={() => setGraphType("3D")}
            >
              3D
            </button>
          </div>
          <br />
          <p className="text-gray-400 text-right">
            Last Update:{" "}
            {data.lastUpdate
              ? new Date(data.lastUpdate).toLocaleString()
              : "Unknown"}
          </p>
        </div>
      )}
      {graphData && graphType == "2D" ? (
        <NetworkGraph2d graphData={graphData} />
      ) : (
        <NetworkGraph3d graphData={graphData} />
      )}
    </div>
  );
}

export default Dashboard;
