import { ForceGraph3DInstance } from "3d-force-graph";
import { Link } from "@utils/render_graph";
import { add, isBefore, sub } from "date-fns";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef } from "react";
import { GraphData } from "react-force-graph-3d";
import { Types } from "./types";

const ForceGraph3d = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});
let tick = 0;
const now = new Date();
const SarafuNetworkGraph = (props: SarafuNetworkGraphProps) => {
  console.log("Rerender");
  const date = React.useRef(now);
  // const [graphData, setGraphData] = React.useState<GraphData>({
  //   nodes: [],
  //   links: [],
  // });
  const ref = useRef<ForceGraph3DInstance>();
  // useEffect(() => {
  //   setInterval(() => {
  //     // + 1 day every second
  //     date.current = add(date.current, { hours: 4 });
  //     // Set the current date to the ref.current
  //     // tick
  //     // update  graphData
  //     setGraphData({
  //       nodes:
  //         props.graphData?.nodes?.filter((n) =>
  //           isBefore(n.date, date.current)
  //         ) ?? [],
  //       links:
  //         props.graphData?.links?.filter((l) =>
  //           isBefore(l.date, date.current)
  //         ) ?? [],
  //     });
  //     // const { nodes, links } = ref.current?.graphData();
  //     // const id = nodes.length;
  //     // ref.current?.graphData({
  //     //   nodes: [...nodes, { id }],
  //     //   links: [
  //     //     ...links,
  //     //     { source: id, target: Math.round(Math.random() * (id - 1)) },
  //     //   ],
  //     // });
  //     ++tick;
  //   }, 250);
  // }, []);
  const handleClick = useCallback(
    (node) => {
      // Node 0xAddress
      navigator.clipboard.writeText(node.id);
      // Camera points to node from outside
      const distance = 50;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      if (
        ref.current &&
        (ref.current as object).hasOwnProperty("cameraPosition")
      ) {
        (ref.current as Types.CameraPosition).cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          }, // new position
          node, // ({ x, y, z })
          3000
        );
      }
    },
    [ref]
  );

  return (
    <ForceGraph3d
      ref={ref}
      
      enableNodeDrag={false}
      nodeLabel={(d: Node & { id: number }) =>
        `<span style="color: grey">${d.id}</span>`
      }
      linkLabel={(d: Link) =>
        `<span style="color: grey">${
          //@ts-ignore
          d?.token_symbol ?? d?.token_name ?? "?"
        }</span>`
      }
      backgroundColor="rgba(0,0,0,0)"
      graphData={props.graphData}
      onNodeClick={handleClick}
      linkAutoColorBy="token_symbol"
    />
  );
};

interface SarafuNetworkGraphProps {
  graphData: Types.DataObject;
}

export default SarafuNetworkGraph;

function objectSize(graphData: any): any {
  return Object.keys(graphData).reduce((acc, key) => {
    return acc + graphData[key].length;
  }, 0);
}
