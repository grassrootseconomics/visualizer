import { ForceGraph3DInstance } from "3d-force-graph";
import { Links, Nodes } from "@utils/render_graph";
import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { Types } from "./types";

const ForceGraph3d = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});
export const NetworkGraph3d = (props: SarafuNetworkGraphProps) => {
  const ref = useRef<ForceGraph3DInstance>();

  const handleNodeClick = useCallback((node) => {
    // Node 0xAddress
    navigator.clipboard.writeText(node.id);
    window.open(`https://celoscan.io/address/${node.id}`, "_blank");
  }, []);
  const handleLinkClick = useCallback((link: Links[0]) => {
    // Node 0xAddress
    navigator.clipboard.writeText(link.voucher_address);
    window.open(
      `https://sarafu.network/vouchers/${link.voucher_address}`,
      "_blank"
    );
  }, []);
  return (
    <ForceGraph3d
      ref={ref}
      enableNodeDrag={false}
      nodeLabel={(node: Nodes[0]) =>
        `<span style="padding:4px 8px;border-radius: 8px;background-color: white;color: grey">${node.id}</span>`
      }
      linkLabel={(link: Links[0]) =>
        `<span style="padding:4px 8px;border-radius: 8px;background-color: white;color: grey">${
          //@ts-ignore
          `${link?.symbol} ${link?.voucher_name}`
        }</span>`
      }
      backgroundColor="rgba(0,0,0,0)"
      graphData={props.graphData}
      onNodeClick={handleNodeClick}
      onLinkClick={handleLinkClick}
      nodeAutoColorBy={(n: Nodes[0]) => {
        return Object.keys(n.usedVouchers)[0];
      }}
      linkAutoColorBy="voucher_address"
    />
  );
};

interface SarafuNetworkGraphProps {
  graphData: Types.DataObject;
}
