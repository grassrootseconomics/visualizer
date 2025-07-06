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
  // Pre-index vouchers by address for O(1) lookup
  const vouchersByAddress = new Map<string, Voucher>();
  for (const voucher of network.vouchers) {
    vouchersByAddress.set(voucher.voucher_address, voucher);
  }

  // Use Map for O(1) link lookups
  const linkMap = new Map<
    string,
    {
      voucher_name: string;
      symbol: string;
      source: string;
      target: string;
      voucher_address: string;
      date: number;
      value: number;
    }
  >();

  // Track addresses and their transaction counts
  const addresses = new Map<
    string,
    {
      usedVouchers: Map<string, number>;
      transactionCount: number;
    }
  >();

  // Process transactions once
  for (const tx of network.transactions) {
    const linkKey = `${tx.sender_address}-${tx.recipient_address}-${tx.voucher_address}`;
    const txDateTime = tx.date_block.getTime();

    // Handle links
    const existingLink = linkMap.get(linkKey);
    if (existingLink) {
      existingLink.value++;
      if (txDateTime < existingLink.date) {
        existingLink.date = txDateTime;
      }
    } else {
      const voucher = vouchersByAddress.get(tx.voucher_address);
      linkMap.set(linkKey, {
        voucher_name: voucher?.voucher_name ?? "Unknown",
        symbol: voucher?.symbol ?? "Unknown",
        source: tx.sender_address,
        target: tx.recipient_address,
        voucher_address: tx.voucher_address,
        date: txDateTime,
        value: 1,
      });
    }

    // Handle addresses (both sender and recipient)
    updateAddress(addresses, tx.sender_address, tx.voucher_address, txDateTime);
    updateAddress(
      addresses,
      tx.recipient_address,
      tx.voucher_address,
      txDateTime
    );
  }

  return {
    links: Array.from(linkMap.values()),
    nodes: Array.from(addresses.entries()).map(([address, data]) => ({
      id: address,
      group: 1,
      usedVouchers: Object.fromEntries(data.usedVouchers),
      value: data.transactionCount,
    })),
  };
};

function updateAddress(
  addresses: Map<
    string,
    {
      usedVouchers: Map<string, number>;
      transactionCount: number;
    }
  >,
  address: string,
  voucherAddress: string,
  txDateTime: number
) {
  let addressData = addresses.get(address);

  if (!addressData) {
    addressData = {
      usedVouchers: new Map(),
      transactionCount: 1,
    };
    addresses.set(address, addressData);
  } else {
    addressData.transactionCount++;
  }

  // Update voucher usage
  const existingVoucherTime = addressData.usedVouchers.get(voucherAddress);
  if (existingVoucherTime === undefined || txDateTime < existingVoucherTime) {
    addressData.usedVouchers.set(voucherAddress, txDateTime);
  }
}

export type GraphData = {
  links: Links;
  nodes: Nodes;
};
export type Nodes = ReturnType<typeof generateGraphData>["nodes"];
export type Links = ReturnType<typeof generateGraphData>["links"];

export type Node = Nodes[0];
export type Link = Links[0];
