/**
 * Types for the 3D globe geographic visualization
 */

/** A geographic coordinate */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** A point on the globe representing a geo-located entity */
export interface GlobePoint {
  id: string;
  lat: number;
  lng: number;
  type: "account" | "voucher" | "pool";
  label: string;
  locationName: string | null;
  value: number;
  color: string;
  radius: number | null;
  voucherAddress?: string;
  voucherSymbol?: string;
  usedVouchers?: string[];
}

/** An arc on the globe representing transaction flow between geo-located entities */
export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
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

/** Ring effect for recent transaction pulses */
export interface GlobeRing {
  lat: number;
  lng: number;
  maxRadius: number;
  propagationSpeed: number;
  repeatPeriod: number;
  color: string;
}

/** Complete data payload for the globe view */
export interface GlobeData {
  points: GlobePoint[];
  arcs: GlobeArc[];
  unmappedAccountCount: number;
  totalAccountCount: number;
}

/** API response for the globe endpoint */
export interface GlobeDataResponse {
  globeData: GlobeData;
  lastUpdate: number;
}
