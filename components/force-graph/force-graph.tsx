import { Link } from "@utils/render_graph";
import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { Types } from "./types";

const ForceGraph3d = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

const SarafuNetworkGraph = (props: SarafuNetworkGraphProps) => {
  const dt = props.data;
  const ref = useRef();
  const handleClick = useCallback(
    (node) => {
      // Node Address
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
      graphData={dt}
      onNodeClick={handleClick}
      linkAutoColorBy="token_address"
    />
  );
};

interface SarafuNetworkGraphProps {
  data: Types.DataObject;
}

export default SarafuNetworkGraph;
