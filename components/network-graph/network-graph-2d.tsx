import { Link } from "@utils/render_graph";
import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { Types } from "./types";

const ForceGraph2d = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});
export const NetworkGraph2d = (props: SarafuNetworkGraphProps) => {
  console.debug("Rerendered Network Graph");

  const ref = useRef();

  const handleClick = useCallback(
    (node) => {
      // Node 0xAddress
      navigator.clipboard.writeText(node.id);
    },
    [ref]
  );

  return (
    <ForceGraph2d
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

