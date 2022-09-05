import type { tokens } from "@prisma/client";
import { isBefore } from "date-fns";

const faucets = [
  "0xcd9fd1e71F684cfb30fA34831ED7ED59f6f77469",
  "0x59a5E2fAF8163fE24cA006a221dD0f34c5e0Cb41",
  "0x289DeFD53E2D96F05Ba29EbBebD9806C94d04Cb6",
  "0xcA5DA01B6Dac771c8F3625AA1a8931E7DAC41832",
  "0xB8830b647C01433F9492F315ddBFDc35CB3Be6A6",
];
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
      usedVouchers: string[];
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
    if (
      !faucets.includes(tx.sender_address) &&
      !faucets.includes(tx.recipient_address)
    ) {
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
  }
  return {
    links,
    nodes: Object.keys(addresses).map((address) => {
      return {
        id: address,
        group: 1,
        date: addresses[address].firstSeen,
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
  addresses: { [address: string]: { firstSeen: number; usedVouchers: string[] } },
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
      firstSeen: tx.date_block.getTime(),
      usedVouchers: [tx.token_address],
    };
  } else {
    // First Seen
    if (isBefore(tx.date_block, addresses[address].firstSeen)) {
      addresses[address].firstSeen = tx.date_block.getTime();
    }
    // Used Tokens
    if (!addresses[address].usedVouchers.includes(tx.token_address)) {
      addresses[address].usedVouchers.push(tx.token_address);
    }
  }
}
