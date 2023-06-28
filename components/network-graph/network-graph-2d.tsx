import { Link, Nodes } from "@utils/render_graph";
import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { Types } from "./types";

const ForceGraph2d = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});
export const NetworkGraph2d = (props: SarafuNetworkGraphProps) => {
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
        `<span style="padding:4px 8px;border-radius: 8px;background-color: white;color: grey">${d.id}</span>`
      }
      linkLabel={(d: Link) =>
        `<span style="padding:4px 8px;border-radius: 8px;background-color: white;color: grey">${
          //@ts-ignore
          `${d?.symbol} ${d?.voucher_name}`
        }</span>`
      }
      nodeAutoColorBy={(n: Nodes[0]) => {
        return Object.keys(n.usedVouchers)[0];
      }}
      backgroundColor="rgba(0,0,0,0)"
      graphData={props.graphData}
      onNodeClick={handleClick}
      linkAutoColorBy="voucher_address"
      linkWidth={0.1}
    />
  );
};

interface SarafuNetworkGraphProps {
  graphData: Types.DataObject;
}
