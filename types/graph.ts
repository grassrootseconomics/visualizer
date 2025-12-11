/**
 * Core graph types for force-directed graph visualization
 */

export interface GraphNode {
  id: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  group: number;
  value: number;
  color?: string;
  usedVouchers: Record<string, { firstTxDate: number; txCount: number }>;
  // Allow extra properties from upstream data
  [key: string]: unknown;
}

/**
 * Link as returned from the API (source/target are strings)
 */
export interface GraphLink {
  source: string;
  target: string;
  date: number;
  dateFirst?: number;
  contract_address: string;
  token_name: string;
  token_symbol: string;
  value?: number;
  txCount?: number;
  color?: string;
  // Allow extra properties from upstream data
  [key: string]: unknown;
}

/**
 * Link after force simulation mutates it (source/target become objects)
 * Used by graph components internally
 */
export interface RenderedGraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  date: number;
  dateFirst?: number;
  contract_address: string;
  token_name: string;
  token_symbol: string;
  value?: number;
  txCount?: number;
  color?: string;
  [key: string]: unknown;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Props for graph components (2D and 3D)
 */
export interface GraphComponentProps {
  graphData: GraphData;
  chargeStrength?: number;
  linkDistance?: number;
  centerGravity?: number;
  /** Whether to animate nodes/links appearing (default: true) */
  animate?: boolean;
  /** Callback when a node is clicked */
  onNodeClick?: (node: GraphNode) => void;
  /** Callback when a link is clicked */
  onLinkClick?: (link: GraphLink) => void;
}

/**
 * Camera position callback type for 3D graph
 */
export interface CameraPositionCallback {
  cameraPosition: (
    position: { x: number; y: number; z: number },
    lookAt: object,
    transitionDuration: number
  ) => void;
}

/**
 * Minimal interface for the force-graph instance
 */
export interface ForceGraphInstance {
  d3Force: (name: string) => unknown;
  d3ReheatSimulation?: () => void;
}

/**
 * Options for the useGraphData hook
 */
export interface UseGraphDataOptions {
  inputData: GraphData;
  is3D?: boolean;
  /** Minimum links required for a node to be included */
  minLinkCount?: number;
  /** Whether to animate nodes/links appearing (default: true) */
  animate?: boolean;
}
