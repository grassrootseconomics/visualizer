import { getFormattedValue } from "./units";

type Voucher = {
  id: number;
  contract_address: string;
  removed: boolean;
  sink_address: string;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
};
type Transaction = {
  tx_type: string;
  id: number;
  contract_address: string;
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
  const voucherMap = new Map<string, Voucher>();
  for (const voucher of network.vouchers) {
    voucherMap.set(voucher.contract_address, voucher);
  }

  // Use Map for O(1) link lookups
  const linkMap = new Map<
    string,
    {
      token_name: string;
      token_symbol: string;
      source: string;
      target: string;
      contract_address: string;
      date: number;
      value: number;
    }
  >();

  // Track addresses and their transaction counts
  const nodeMap = new Map<
    string,
    {
      usedVouchers: Map<string, number>;
      transactionCount: number;
    }
  >();

  // Process transactions once
  for (const tx of network.transactions) {
    const txDateTime = tx.date_block.getTime();
    const linkKey = `${tx.sender_address}-${tx.recipient_address}-${tx.contract_address}-${txDateTime}`;

    // Handle links
    const existingLink = linkMap.get(linkKey);

    const voucher = voucherMap.get(tx.contract_address);

    if (existingLink) {
      existingLink.value += getFormattedValue(
        BigInt(tx.tx_value),
        voucher.token_decimals
      ).formattedNumber;
      if (txDateTime < existingLink.date) {
        existingLink.date = txDateTime;
      }
    } else {
      linkMap.set(linkKey, {
        token_name: voucher?.token_name ?? "Unknown",
        token_symbol: voucher?.token_symbol ?? "Unknown",
        source: tx.sender_address,
        target: tx.recipient_address,
        contract_address: tx.contract_address,
        date: txDateTime,
        value: getFormattedValue(BigInt(tx.tx_value), voucher.token_decimals)
          .formattedNumber,
      });
    }

    // Handle addresses (both sender and recipient)
    updateAddress(nodeMap, tx.sender_address, tx.contract_address, txDateTime);
    updateAddress(
      nodeMap,
      tx.recipient_address,
      tx.contract_address,
      txDateTime
    );
  }

  return {
    links: Array.from(linkMap.values()),
    nodes: Array.from(nodeMap.entries()).map(([address, data]) => ({
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
