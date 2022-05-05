import { NetworkGraph } from "@components/network-graph";
import { getNodesAndLinks } from "@utils/render_graph";
import { useCache } from "hooks/useCache";
import React from "react";




function Dashboard(props) {
  const { data, error } = useCache({
    limit: props.limit,
    offset: props.offset,
    blockOffset: props.blockOffset,
  });

  if (error) return "An error has occurred.";
  if (!data)
    return (
      <div className="h-[90vh] flex items-center justify-center ">
        <div className="w-40 h-40 border-t-4 border-b-4 border-green-900 rounded-full animate-spin"></div>
      </div>
    );
  const nodesAndLinks = getNodesAndLinks(data);
  return (
    <div className="w-screen h-[90vh] overflow-hidden my-auto">
      {data && (
        <NetworkGraph nodes={nodesAndLinks.nodes} links={nodesAndLinks.links} />
      )}
    </div>
  );
}
Dashboard.getInitialProps = async ({ query }) => {
  const limit = query?.limit ? parseInt(query.limit) : 300000;
  const offset = query?.offset ? parseInt(query.offset) : undefined;
  const blockOffset = query?.blockOffset
    ? parseInt(query.blockOffset)
    : undefined;
  const props = { limit, offset, blockOffset };
  return props;
};

export default Dashboard;
