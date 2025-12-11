/**
 * Network graph component types
 * Re-exports from centralized types for backward compatibility
 */

import type { GraphData, CameraPositionCallback } from "@/types/graph";

export namespace Types {
  export type DataObject = GraphData;
  export type CameraPosition = CameraPositionCallback;
}
