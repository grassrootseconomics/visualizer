/**
 * Globe data transformation from raw database records
 *
 * Transforms account/voucher geo locations and transactions into
 * globe-ready points and arcs for geographic visualization.
 */

import type { Voucher } from "@/types/voucher";
import type { GlobeData, GlobePoint, GlobeArc } from "@/types/globe";
import type {
  AccountGeoRow,
  VoucherGeoRow,
  PoolSwapRow,
} from "../queries/geo-data";
import type { TransactionRow } from "../queries/transactions";

interface GeoLocation {
  lat: number;
  lng: number;
  label: string;
  locationName: string | null;
}

interface PoolWithTokens {
  pool_address: string;
  pool_name: string;
  pool_symbol: string;
  owner_address: string;
  allowed_tokens: string[];
}

// Grid quantization resolution (~11km at equator) for arc aggregation
const GRID_RESOLUTION = 0.1;

/** Quantize a coordinate to grid cell */
function quantize(val: number): number {
  return Math.round(val / GRID_RESOLUTION) * GRID_RESOLUTION;
}

/** Simple color generation from string hash */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

interface ArcAccumulator {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  value: number;
  txCount: number;
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  date: number;
  dateFirst: number;
  sourceId: string;
  targetId: string;
}

/**
 * Generate globe visualization data from geo-enriched network data
 */
export function generateGlobeData(input: {
  accountGeos: AccountGeoRow[];
  voucherGeos: VoucherGeoRow[];
  poolSwaps: PoolSwapRow[];
  transactions: TransactionRow[];
  vouchers: Voucher[];
  pools: PoolWithTokens[];
}): GlobeData {
  const {
    accountGeos,
    voucherGeos,
    poolSwaps,
    transactions,
    vouchers,
    pools,
  } = input;

  // 1. Build address → geo lookup from account data
  // Point mapping: x = latitude, y = longitude (confirmed by user)
  const addressGeoMap = new Map<string, GeoLocation>();
  for (const row of accountGeos) {
    if (!row.geo) continue;
    const label = [row.given_names, row.family_name]
      .filter(Boolean)
      .join(" ") || row.blockchain_address.slice(0, 10);
    addressGeoMap.set(row.blockchain_address, {
      lat: row.geo.x,
      lng: row.geo.y,
      label,
      locationName: row.location_name,
    });
  }

  // 2. Build voucher address → geo lookup
  const voucherGeoMap = new Map<
    string,
    GeoLocation & { radius: number | null; voucherName: string; symbol: string }
  >();
  for (const row of voucherGeos) {
    if (!row.geo) continue;
    voucherGeoMap.set(row.voucher_address, {
      lat: row.geo.x,
      lng: row.geo.y,
      label: row.voucher_name,
      locationName: row.location_name,
      radius: row.radius,
      voucherName: row.voucher_name,
      symbol: row.symbol,
    });
  }

  // 3. Build voucher map for token info lookup
  const voucherMap = new Map<string, Voucher>();
  for (const v of vouchers) {
    voucherMap.set(v.contract_address, v);
  }

  // 4. Infer pool positions from centroid of their allowed tokens' voucher geos
  const poolGeoMap = new Map<string, GeoLocation>();
  for (const pool of pools) {
    const tokenGeos: { lat: number; lng: number }[] = [];
    for (const tokenAddr of pool.allowed_tokens) {
      const vGeo = voucherGeoMap.get(tokenAddr);
      if (vGeo) tokenGeos.push({ lat: vGeo.lat, lng: vGeo.lng });
    }
    if (tokenGeos.length > 0) {
      const centroidLat =
        tokenGeos.reduce((sum, g) => sum + g.lat, 0) / tokenGeos.length;
      const centroidLng =
        tokenGeos.reduce((sum, g) => sum + g.lng, 0) / tokenGeos.length;
      poolGeoMap.set(pool.pool_address, {
        lat: centroidLat,
        lng: centroidLng,
        label: pool.pool_name,
        locationName: null,
      });
    }
  }

  // 5. Build GlobePoints
  const points: GlobePoint[] = [];

  // Account points - only include accounts that have transactions
  const accountTxCount = new Map<string, number>();
  for (const tx of transactions) {
    accountTxCount.set(
      tx.sender_address,
      (accountTxCount.get(tx.sender_address) ?? 0) + 1
    );
    accountTxCount.set(
      tx.recipient_address,
      (accountTxCount.get(tx.recipient_address) ?? 0) + 1
    );
  }
  for (const swap of poolSwaps) {
    accountTxCount.set(
      swap.initiator_address,
      (accountTxCount.get(swap.initiator_address) ?? 0) + 1
    );
  }

  for (const [address, geo] of addressGeoMap) {
    const txCount = accountTxCount.get(address);
    if (!txCount) continue; // Skip accounts with no transactions
    points.push({
      id: address,
      lat: geo.lat,
      lng: geo.lng,
      type: "account",
      label: geo.label,
      locationName: geo.locationName,
      value: txCount,
      color: "#10B981", // emerald-500
      radius: null,
    });
  }

  // Voucher points
  for (const [voucherAddr, geo] of voucherGeoMap) {
    points.push({
      id: voucherAddr,
      lat: geo.lat,
      lng: geo.lng,
      type: "voucher",
      label: geo.voucherName,
      locationName: geo.locationName,
      value: 1,
      color: stringToColor(voucherAddr),
      radius: geo.radius,
      voucherAddress: voucherAddr,
      voucherSymbol: geo.symbol,
    });
  }

  // Pool points
  for (const [poolAddr, geo] of poolGeoMap) {
    const pool = pools.find((p) => p.pool_address === poolAddr);
    points.push({
      id: poolAddr,
      lat: geo.lat,
      lng: geo.lng,
      type: "pool",
      label: pool?.pool_name ?? "Pool",
      locationName: null,
      value: 1,
      color: "#F59E0B", // amber-500
      radius: null,
    });
  }

  // 6. Build arcs from transactions
  const arcMap = new Map<string, ArcAccumulator>();
  let unmappedAccountCount = 0;
  const allAddresses = new Set<string>();

  for (const tx of transactions) {
    allAddresses.add(tx.sender_address);
    allAddresses.add(tx.recipient_address);

    const senderGeo = addressGeoMap.get(tx.sender_address);
    const recipientGeo = addressGeoMap.get(tx.recipient_address);
    const txDate = tx.date_block.getTime();
    const voucher = voucherMap.get(tx.contract_address);
    const tokenName = voucher?.token_name ?? "Unknown";
    const tokenSymbol = voucher?.token_symbol ?? "?";

    let startLat: number, startLng: number, endLat: number, endLng: number;

    if (senderGeo && recipientGeo) {
      // Both mapped - arc between them
      startLat = senderGeo.lat;
      startLng = senderGeo.lng;
      endLat = recipientGeo.lat;
      endLng = recipientGeo.lng;
    } else if (senderGeo) {
      // Only sender mapped - pin to sender location
      startLat = senderGeo.lat;
      startLng = senderGeo.lng;
      endLat = senderGeo.lat;
      endLng = senderGeo.lng;
    } else if (recipientGeo) {
      // Only recipient mapped - pin to recipient location
      startLat = recipientGeo.lat;
      startLng = recipientGeo.lng;
      endLat = recipientGeo.lat;
      endLng = recipientGeo.lng;
    } else {
      // Neither mapped - skip
      continue;
    }

    // Aggregate by quantized grid cell pair + contract
    const arcKey = `${quantize(startLat)},${quantize(startLng)}-${quantize(endLat)},${quantize(endLng)}-${tx.contract_address}`;
    const existing = arcMap.get(arcKey);

    if (existing) {
      existing.txCount++;
      existing.value += Number(tx.tx_value);
      if (txDate > existing.date) existing.date = txDate;
      if (txDate < existing.dateFirst) existing.dateFirst = txDate;
    } else {
      arcMap.set(arcKey, {
        startLat,
        startLng,
        endLat,
        endLng,
        value: Number(tx.tx_value),
        txCount: 1,
        contractAddress: tx.contract_address,
        tokenName,
        tokenSymbol,
        date: txDate,
        dateFirst: txDate,
        sourceId: tx.sender_address,
        targetId: tx.recipient_address,
      });
    }
  }

  // 7. Process pool swap transactions
  for (const swap of poolSwaps) {
    allAddresses.add(swap.initiator_address);

    const initiatorGeo = addressGeoMap.get(swap.initiator_address);
    const poolGeo = poolGeoMap.get(swap.contract_address);
    const txDate = swap.date_block.getTime();

    let startLat: number, startLng: number, endLat: number, endLng: number;

    if (initiatorGeo && poolGeo) {
      startLat = initiatorGeo.lat;
      startLng = initiatorGeo.lng;
      endLat = poolGeo.lat;
      endLng = poolGeo.lng;
    } else if (initiatorGeo) {
      startLat = initiatorGeo.lat;
      startLng = initiatorGeo.lng;
      endLat = initiatorGeo.lat;
      endLng = initiatorGeo.lng;
    } else if (poolGeo) {
      startLat = poolGeo.lat;
      startLng = poolGeo.lng;
      endLat = poolGeo.lat;
      endLng = poolGeo.lng;
    } else {
      continue;
    }

    // Token in info for arc color
    const voucher = voucherMap.get(swap.token_in_address);
    const tokenName = voucher?.token_name ?? "Swap";
    const tokenSymbol = voucher?.token_symbol ?? "SWAP";

    const arcKey = `${quantize(startLat)},${quantize(startLng)}-${quantize(endLat)},${quantize(endLng)}-swap-${swap.contract_address}`;
    const existing = arcMap.get(arcKey);

    if (existing) {
      existing.txCount++;
      existing.value += Number(swap.in_value);
      if (txDate > existing.date) existing.date = txDate;
      if (txDate < existing.dateFirst) existing.dateFirst = txDate;
    } else {
      arcMap.set(arcKey, {
        startLat,
        startLng,
        endLat,
        endLng,
        value: Number(swap.in_value),
        txCount: 1,
        contractAddress: swap.contract_address,
        tokenName,
        tokenSymbol,
        date: txDate,
        dateFirst: txDate,
        sourceId: swap.initiator_address,
        targetId: swap.contract_address,
      });
    }
  }

  // Count unmapped accounts
  for (const addr of allAddresses) {
    if (!addressGeoMap.has(addr)) unmappedAccountCount++;
  }

  // Convert arcs, filtering out self-arcs (same start/end) with txCount < 2
  const arcs: GlobeArc[] = [];
  for (const arc of arcMap.values()) {
    const isSelfArc =
      Math.abs(arc.startLat - arc.endLat) < 0.001 &&
      Math.abs(arc.startLng - arc.endLng) < 0.001;

    // Skip self-arcs with very few transactions (reduces noise)
    if (isSelfArc && arc.txCount < 2) continue;

    const color = stringToColor(arc.contractAddress);
    arcs.push({
      ...arc,
      color,
      label: `${arc.tokenName}: ${arc.txCount} txns`,
    });
  }

  return {
    points,
    arcs,
    unmappedAccountCount,
    totalAccountCount: allAddresses.size,
  };
}
