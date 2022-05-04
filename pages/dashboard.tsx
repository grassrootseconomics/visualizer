import { Link, NetworkGraph, Node } from "@components/network-graph";
import { getAllCacheUrl } from "@utils/cache";
import { Transaction } from "models/Transaction";
import { useRouter } from "next/router";
import React from "react";

const faucets = [
  "cd9fd1e71F684cfb30fA34831ED7ED59f6f77469",
  "59a5E2fAF8163fE24cA006a221dD0f34c5e0Cb41",
  "289DeFD53E2D96F05Ba29EbBebD9806C94d04Cb6",
];

const getNodesAndLinks = (transactions: Transaction[]) => {
  const addresses = new Set<string>();
  const links = [];
  for (const tx of transactions) {
    if (!faucets.includes(tx.sender) && !faucets.includes(tx.recipient)) {
      const exsisteingLinkIndex = links.findIndex(
        (predicate) =>
          predicate.source === tx.sender && predicate.target === tx.recipient
      );
      if (exsisteingLinkIndex === -1) {
        links.push({
          source: tx.sender,
          target: tx.recipient,
          token: tx.source_token,
          value: 1,
        });
      } else {
        links[exsisteingLinkIndex].value++;
      }

      addresses.add(tx.sender);
      addresses.add(tx.recipient);
    }
  }
  return {
    links,
    nodes: [...addresses].map((address) => {
      return {
        id: address,
        group: 1,
        value: transactions.reduce((acc, v) => {
          if (v.sender === address) {
            acc = acc + 1;
          }
          if (v.recipient === address) {
            acc = acc + 1;
          }
          return acc;
        }, 1),
      };
    }),
  };
};

function Transactions(props) {
  const [data, setData] = React.useState<{
    nodes: Node[];
    links: Link[];
  } | null>();
  const router = useRouter();
  const cacheUrl = getAllCacheUrl({
    limit: props.limit,
    offset: props.offset,
    blockOffset: props.blockOffset,
  });
  const fetchTransactions = async () => {
    const response = await fetch(cacheUrl);
    const data = await response.json();
    const transactions = data.data as Transaction[];
    console.info(
      `Fetched ${transactions.length} transactions from ${cacheUrl}`
    );
    const d = getNodesAndLinks(transactions);
    setData(d);
  };
  React.useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="w-screen h-[90vh] overflow-hidden my-auto">
      {data && <NetworkGraph nodes={data.nodes} links={data.links} />}
    </div>
  );
}
Transactions.getInitialProps = async ({ query }) => {
  const limit = query?.limit ? parseInt(query.limit) : 300000;
  const offset = query?.offset ? parseInt(query.offset) : undefined;
  const blockOffset = query?.blockOffset
    ? parseInt(query.blockOffset)
    : undefined;
  const props = { limit, offset, blockOffset };
  return props;
};

export default Transactions;
