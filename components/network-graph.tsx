import { NetworkGraphData, renderNetworkGraph } from "@utils/render_graph";
import { useD3 } from "hooks/useD3";
import { useRouter } from "next/router";
import React from "react";
export type Link = {
  source: string;
  target: string;
  token: string;
  value: number;
};
export type Node = {
  id: string;
  group: number;
  value: number;
};
export function NetworkGraph(data: NetworkGraphData) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);

  const ref = useD3(
    (svg) =>
      renderNetworkGraph(svg, data, {
        height: window.innerHeight,
        width: window.innerWidth,
        onNodeClick: (n) => {
          router.push({
            pathname: `/transactions`,
            query: {
              address: `0x${n.id}`,
            },
          });
        },
        onLoaded: () => {
          setLoading(false);
        },
      }),
    data
  );

  return (
    <>
      <svg
        ref={ref}
        style={{
          height: 500,
          width: "100%",
          marginRight: "0px",
          marginLeft: "0px",
        }}
      ></svg>
    </>
  );
}
