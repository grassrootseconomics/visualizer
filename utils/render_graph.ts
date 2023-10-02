import { isBefore } from "date-fns";
import { Point } from "kysely-codegen";
type Voucher = {
  symbol: string;
  id: number;
  voucher_address: string;
  voucher_name: string;
  voucher_description: string;
  active: boolean;
  location_name: string;
  geo: Point;
  created_at: Date;
  radius: number;
};
type Transaction = {
  tx_type: string;
  id: number;
  voucher_address: string;
  tx_hash: string;
  block_number: number;
  tx_index: number;
  sender_address: string;
  recipient_address: string;
  tx_value: string;
  date_block: Date;
  success: boolean;
};
interface NetworkData {
  vouchers: Voucher[];
  transactions: Transaction[];
}

export const generateGraphData = (network: NetworkData) => {
  const addresses: {
    [address: string]: {
      firstSeen: number;
      usedVouchers: { [address: string]: number };
    };
  } = {};

  let links: {
    voucher_name: string;
    symbol: string;
    source: string;
    target: string;
    voucher_address: string;
    date: number;
    value: number;
  }[] = [];
  for (const tx of network.transactions) {
    const exsisteingLinkIndex = links.findIndex(
      (predicate) =>
        predicate.source === tx.sender_address &&
        predicate.target === tx.recipient_address &&
        predicate.voucher_address === tx.voucher_address
    );
    if (exsisteingLinkIndex === -1) {
      const token = network.vouchers.find(
        (token) => token.voucher_address === tx.voucher_address
      );
      // if (!token) {
      //   console.log(`Unknown Token ${tx.token_address}`);
      // }
      links.push({
        voucher_name: token?.voucher_name ?? "Unknown",
        symbol: token?.symbol ?? "Unknown",
        source: tx.sender_address,
        target: tx.recipient_address,
        voucher_address: tx.voucher_address,
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
  tx: Transaction,
  address: string
) {
  if (!addresses[address]) {
    addresses[address] = {
      usedVouchers: {
        [tx.voucher_address]: tx.date_block.getTime(),
      },
    };
  } else {
    if (
      !Object.keys(addresses[address].usedVouchers).includes(tx.voucher_address)
    ) {
      addresses[address].usedVouchers[tx.voucher_address] =
        tx.date_block.getTime();
    } else if (
      isBefore(
        tx.date_block,
        addresses[address].usedVouchers[tx.voucher_address]
      )
    ) {
      addresses[address].usedVouchers[tx.voucher_address] =
        tx.date_block.getTime();
    }
  }
}
