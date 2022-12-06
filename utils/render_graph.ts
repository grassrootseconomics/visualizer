import type { tokens } from "@prisma/client";
import { isBefore } from "date-fns";

interface NetworkData {
  tokens: tokens[];
  transactions: {
    recipient_address: string;
    sender_address: string;
    tx_hash: string;
    tx_value: bigint;
    token_address: string;
    date_block: Date;
  }[];
}

export const generateGraphData = (network: NetworkData) => {
  const addresses: {
    [address: string]: {
      firstSeen: number;
      usedVouchers: { [address: string]: number };
    };
  } = {};

  let links: {
    token_name: string;
    token_symbol: string;
    source: string;
    target: string;
    token_address: string;
    date: number;
    value: number;
  }[] = [];
  for (const tx of network.transactions) {
    const exsisteingLinkIndex = links.findIndex(
      (predicate) =>
        predicate.source === tx.sender_address &&
        predicate.target === tx.recipient_address &&
        predicate.token_address === tx.token_address
    );
    if (exsisteingLinkIndex === -1) {
      const token = network.tokens.find(
        (token) => token.token_address === tx.token_address
      );
      // if (!token) {
      //   console.log(`Unknown Token ${tx.token_address}`);
      // }
      links.push({
        token_name: token?.token_name ?? "Unknown",
        token_symbol: token?.token_symbol ?? "Unknown",
        source: tx.sender_address,
        target: tx.recipient_address,
        token_address: tx.token_address,
        date: tx.date_block.getTime(),
        value: 1,
      });
    } else {
      links[exsisteingLinkIndex].value++;
      if (isBefore(tx.date_block, links[exsisteingLinkIndex].date)) {
        links[exsisteingLinkIndex].date = tx.date_block.getTime();
      }
    }
    addAddress(addresses, tx, tx.sender_address);
    addAddress(addresses, tx, tx.recipient_address);
  }
  return {
    links,
    nodes: Object.keys(addresses).map((address) => {
      return {
        id: address,
        group: 1,
        usedVouchers: addresses[address].usedVouchers,
        value: network.transactions.reduce((acc, v) => {
          if (v.sender_address === address) {
            acc = acc + 1;
          }
          if (v.recipient_address === address) {
            acc = acc + 1;
          }
          return acc;
        }, 1),
      };
    }),
  };
};
export type GraphData = {
  links: Links;
  nodes: Nodes;
};
export type Nodes = ReturnType<typeof generateGraphData>["nodes"];
export type Links = ReturnType<typeof generateGraphData>["links"];

export type Node = Nodes[0];
export type Link = Links[0];

function addAddress(
  addresses: {
    [address: string]: { usedVouchers: { [address: string]: number } };
  },
  tx: {
    recipient_address: string;
    sender_address: string;
    tx_hash: string;
    tx_value: bigint;
    token_address: string;
    date_block: Date;
  },
  address: string
) {
  if (!addresses[address]) {
    addresses[address] = {
      usedVouchers: {
        [tx.token_address]: tx.date_block.getTime(),
      },
    };
  } else {
    if (
      !Object.keys(addresses[address].usedVouchers).includes(tx.token_address)
    ) {
      addresses[address].usedVouchers[tx.token_address] =
        tx.date_block.getTime();
    } else if (
      isBefore(tx.date_block, addresses[address].usedVouchers[tx.token_address])
    ) {
      addresses[address].usedVouchers[tx.token_address] =
        tx.date_block.getTime();
    }
  }
}
