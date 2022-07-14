import type { tokens } from "@prisma/client";

const faucets = [
  "0xcd9fd1e71F684cfb30fA34831ED7ED59f6f77469",
  "0x59a5E2fAF8163fE24cA006a221dD0f34c5e0Cb41",
  "0x289DeFD53E2D96F05Ba29EbBebD9806C94d04Cb6",
  "0xcA5DA01B6Dac771c8F3625AA1a8931E7DAC41832",
  "0xB8830b647C01433F9492F315ddBFDc35CB3Be6A6",
];
export const getNodesAndLinks = (
  tokens: tokens[],
  transactions: {
    recipient_address: string;
    sender_address: string;
    tx_hash: string;
    tx_value: bigint;
    token_address: string;
  }[]
) => {
  const addresses = new Set<string>();
  let links: {
    token_name: string;
    token_symbol: string;
    source: string;
    target: string;
    token_address: string;
    value: number;
  }[] = [];
  for (const tx of transactions) {
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
        const token = tokens.find(
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
          value: 1,
        });
      } else {
        links[exsisteingLinkIndex].value++;
      }

      addresses.add(tx.sender_address);
      addresses.add(tx.recipient_address);
    }
  }
  return {
    links,
    nodes: [...addresses].map((address) => {
      return {
        id: address,
        group: 1,
        value: transactions.reduce((acc, v) => {
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
export type Nodes = ReturnType<typeof getNodesAndLinks>["nodes"];
export type Links = ReturnType<typeof getNodesAndLinks>["links"];

export type Node = ReturnType<typeof getNodesAndLinks>["nodes"][0];
export type Link = ReturnType<typeof getNodesAndLinks>["links"][0];
