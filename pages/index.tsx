import SarafuNetworkGraph from "@components/force-graph/force-graph";
import { MultiSelect } from "@components/select";
import { prisma } from "@utils/db";

import { generateGraphData } from "@utils/render_graph";
import { InferGetStaticPropsType } from "next";
import React from "react";
import { GraphData } from "react-force-graph-3d";

const faucets = [
  "cd9fd1e71f684cfb30fa34831ed7ed59f6f77469",
  "289defd53e2d96f05ba29ebbebd9806c94d04cb6", // SARAFU MIGRATOR1
  "59a5e2faf8163fe24ca006a221dd0f34c5e0cb41", // SARAFU MIGRATOR2
  "ca5da01b6dac771c8f3625aa1a8931e7dac41832", // TOKEN DEPLOYER
  "65644d61fb9348a20ca0d89bb42d8152c82081b9", // SARAFU FAUCET
  "bbb4a93c8dcd82465b73a143f00fed4af7492a27", // SARAFU SINK
];
// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps = async () => {
  const tokensP = prisma.tokens.findMany();
  const archivedTokensP = prisma.archived_tokens.findMany();

  const transactionsP = prisma.transactions.findMany({
    where: {
      success: true,
      AND: [
        {
          sender_address: {
            notIn: faucets,
          },
        },
        {
          recipient_address: {
            notIn: faucets,
          },
        },
      ],
    },
    select: {
      tx_hash: true,
      sender_address: true,
      recipient_address: true,
      tx_value: true,
      token_address: true,
      date_block: true,
    },
  });
  const [tokens, archived_tokens, transactions] = await Promise.all([
    tokensP,
    archivedTokensP,
    transactionsP,
  ]);
  console.log(tokens.length, transactions.length);

  const graphData = generateGraphData({
    tokens: [...tokens, ...archived_tokens],
    transactions,
  });
  return {
    props: {
      graphData: graphData,
      tokens,
    },
    revalidate: 60 * 60 * 6, // In seconds
  };
};
function Dashboard(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const [selectedTokens, setSelectedTokens] = React.useState(props.tokens);
  const [graphData, setGraphData] = React.useState(props.graphData);

  React.useEffect(() => {
    setGraphData({
      nodes: props.graphData.nodes.filter((n) =>
        selectedTokens.some((selectedToken) =>
          n.usedVouchers.includes(selectedToken.token_address)
        )
      ),
      links: props.graphData.links.filter((l) =>
        selectedTokens.some(
          (selectedToken) => selectedToken.token_address === l.token_address
        )
      ),
    });
  }, [selectedTokens]);
  return (
    <div className="w-screen h-[100vh] overflow-hidden my-auto">
      <div className="w-96 z-10 absolute top-0 right-0 bg-white m-3 rounded-md  shadow-lg flex-col justify-center align-middle p-3">
        <h1 className="text-black">Vouchers</h1>
        <label
          htmlFor="countries_multiple"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
        >
          Select Vouchers
        </label>
        <div className="flex justify-around">
          <button
            className="text-gray-900"
            onClick={() => setSelectedTokens(props.tokens)}
          >
            Select All
          </button>
          <button
            className="text-gray-900"
            onClick={() => setSelectedTokens([])}
          >
            Unselect All
          </button>
        </div>
        <MultiSelect
          selected={selectedTokens}
          options={props.tokens}
          label="Select Vouchers"
          optionToKey={(o) => o.token_address}
          optionToLabel={(o) => o.token_name}
          onChange={(c) => setSelectedTokens(c)}
        />
      </div>
      {graphData && <SarafuNetworkGraph graphData={graphData} />}
    </div>
  );
}

export default Dashboard;
