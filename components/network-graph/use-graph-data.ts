import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Types } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  // Allow extra properties from upstream data
  [key: string]: any;
}

export interface GraphLink {
  source: string | { id: string };
  target: string | { id: string };
  date: number;
  // Allow extra properties from upstream data
  [key: string]: any;
}

// Minimal interface for the force-graph instance we expect.
// This avoids using `any` on graphRef but keeps things flexible.
interface ForceGraphLike {
  d3Force: (name: string) => any;
  d3ReheatSimulation?: () => void;
}

interface UseGraphDataOptions {
  inputData: Types.DataObject;
  is3D?: boolean;
  /** Minimum links required for a node to be included */
  minLinkCount?: number;
  /** Whether to animate nodes/links appearing (default: true) */
  animate?: Boolean;
}

// ─────────────────────────────────────────────────────────────
// Shared props / config
// ─────────────────────────────────────────────────────────────

export interface GraphComponentProps {
  graphData: Types.DataObject;
  chargeStrength?: number;
  linkDistance?: number;
  centerGravity?: number;
  /** Whether to animate nodes/links appearing (default: true) */
  animate?: Boolean;
}

// Graph simulation config - optimized for large graphs (1000+ nodes, 10K+ links)
export const GRAPH_CONFIG = {
  d3AlphaDecay: 0.08, // Faster cooling (was 0.02) - settles ~4x faster
  d3VelocityDecay: 0.5, // Higher damping (was 0.3) - less oscillation
  backgroundColor: "rgba(0,0,0,0)",
} as const;

const MIN_LINKS_PER_TICK = 10; // Increased from 3 for faster initial render
const MAX_LINKS_PER_TICK = 150; // Increased from 80 for large graphs
const TARGET_TICKS_FOR_QUEUE = 40; // Faster queue clearing (was 60)

// Physics defaults - tuned for large graphs
export const DEFAULT_PHYSICS = {
  chargeStrength: -8, // Reduced from -15 (less computation, O(n²) savings)
  linkDistance: 30, // Increased from 20 (less tight packing = faster settling)
  centerGravity: 0.8, // Slightly reduced for more spread
} as const;

// ─────────────────────────────────────────────────────────────
// Label helpers
// ─────────────────────────────────────────────────────────────

const LABEL_STYLE =
  "padding:4px 8px;border-radius:8px;background-color:white;color:grey";

export const createNodeLabel = (id: string) =>
  `<span style="${LABEL_STYLE}">${id}</span>`;

export const createLinkLabel = (
  tokenSymbol: string,
  tokenName: string,
  txCount?: number
) => {
  const countStr = txCount && txCount > 1 ? ` (${txCount} txns)` : "";
  return `<span style="${LABEL_STYLE}">${tokenSymbol} ${tokenName}${countStr}</span>`;
};

// ─────────────────────────────────────────────────────────────
// Force helpers
// ─────────────────────────────────────────────────────────────

export function useGraphForces(
  graphRef: MutableRefObject<ForceGraphLike | null>,
  chargeStrength: number,
  linkDistance: number,
  centerGravity: number
) {
  const forcesConfigured = useRef(false);

  // Keep forces in sync with props
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || typeof fg.d3Force !== "function") return;

    const charge = fg.d3Force("charge");
    if (charge) charge.strength(chargeStrength);

    const link = fg.d3Force("link");
    if (link) link.distance(linkDistance);

    const center = fg.d3Force("center");
    if (center && typeof center.strength === "function") {
      center.strength(centerGravity);
    }

    if (typeof fg.d3ReheatSimulation === "function") {
      fg.d3ReheatSimulation();
    }
  }, [graphRef, chargeStrength, linkDistance, centerGravity]);

  // Configure once on first engine tick (for libs that need that pattern)
  const configureForces = useCallback(() => {
    const fg = graphRef.current;
    if (!fg || forcesConfigured.current || typeof fg.d3Force !== "function") {
      return;
    }

    const charge = fg.d3Force("charge");
    if (charge && typeof charge.strength === "function") {
      charge.strength(chargeStrength);
      forcesConfigured.current = true;
    }

    const link = fg.d3Force("link");
    if (link && typeof link.distance === "function") {
      link.distance(linkDistance);
    }
  }, [graphRef, chargeStrength, linkDistance]);

  return { configureForces };
}

// ─────────────────────────────────────────────────────────────
// Geometry helpers
// ─────────────────────────────────────────────────────────────

export function calculateCentroid(
  nodes: { x?: number; y?: number; z?: number }[]
) {
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let count = 0;

  for (const node of nodes) {
    if (node.x !== undefined && node.y !== undefined) {
      sumX += node.x;
      sumY += node.y;
      sumZ += node.z || 0;
      count++;
    }
  }

  if (count === 0) return null;

  return {
    x: sumX / count,
    y: sumY / count,
    z: sumZ / count,
  };
}

// ─────────────────────────────────────────────────────────────
// Animation constants / helpers
// ─────────────────────────────────────────────────────────────

export const PULSE_DURATION = 1500; // ms
type TimeoutId = ReturnType<typeof setTimeout>;

export function getLinkKey(link: GraphLink): string {
  const src = getSourceId(link);
  const tgt = getTargetId(link);
  // Use contract_address for unique key since links are now aggregated per source-target-contract
  const contract = link.contract_address || link.date;
  return `${src}|${tgt}|${contract}`;
}

export function getSourceId(link: GraphLink): string {
  return typeof link.source === "object" ? link.source.id : link.source;
}

export function getTargetId(link: GraphLink): string {
  return typeof link.target === "object" ? link.target.id : link.target;
}

// ─────────────────────────────────────────────────────────────
// Positioning helpers
// ─────────────────────────────────────────────────────────────

// Calculate optimal position for a new node based on its neighbors
function calculateNodePosition(
  nodeId: string,
  links: GraphLink[],
  positionedNodes: Map<string, GraphNode>,
  is3D: boolean
): { x?: number; y?: number; z?: number } {
  const neighborIds = new Set<string>();

  for (const link of links) {
    const srcId = getSourceId(link);
    const tgtId = getTargetId(link);
    if (srcId === nodeId) neighborIds.add(tgtId);
    if (tgtId === nodeId) neighborIds.add(srcId);
  }

  const positionedNeighbors: GraphNode[] = [];
  for (const nId of neighborIds) {
    const neighbor = positionedNodes.get(nId);
    if (neighbor?.x !== undefined && neighbor?.y !== undefined) {
      positionedNeighbors.push(neighbor);
    }
  }

  if (positionedNeighbors.length === 0) {
    // No positioned neighbors, let the force simulation do the work
    return {};
  }

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (const neighbor of positionedNeighbors) {
    sumX += neighbor.x!;
    sumY += neighbor.y!;
    sumZ += neighbor.z || 0;
  }

  const centroidX = sumX / positionedNeighbors.length;
  const centroidY = sumY / positionedNeighbors.length;
  const centroidZ = sumZ / positionedNeighbors.length;

  // Small random offset to prevent perfect overlap
  const offset = 10;
  const angle = Math.random() * 2 * Math.PI;
  const randomX = Math.cos(angle) * offset * Math.random();
  const randomY = Math.sin(angle) * offset * Math.random();

  const position: { x: number; y: number; z?: number } = {
    x: centroidX + randomX,
    y: centroidY + randomY,
  };

  if (is3D) {
    const randomZ = (Math.random() - 0.5) * offset;
    position.z = centroidZ + randomZ;
  }

  return position;
}

// ─────────────────────────────────────────────────────────────
// useGraphData hook
// ─────────────────────────────────────────────────────────────

export function useGraphData({
  inputData,
  is3D = false,
  minLinkCount = 1,
  animate = true,
}: UseGraphDataOptions) {
  const [displayedData, setDisplayedData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });

  // Track pulse animations for nodes and links
  const pulsingNodes = useRef<Map<string, number>>(new Map());
  const pulsingLinks = useRef<Map<string, number>>(new Map());

  // Stable storage for positions
  const stableNodes = useRef<Map<string, GraphNode>>(new Map());
  const stableLinks = useRef<Map<string, GraphLink>>(new Map());

  // Queue for incremental additions (only used when animate = true)
  const nodeQueue = useRef<GraphNode[]>([]);
  const linkQueue = useRef<GraphLink[]>([]);
  const timerRef = useRef<TimeoutId | null>(null);

  // Store all valid links for position calculation
  const allValidLinks = useRef<GraphLink[]>([]);

  const processNextItem = useCallback(() => {
    setDisplayedData((prev) => {
      const displayedNodeIds = new Set(prev.nodes.map((n) => n.id));
      let newNodes = prev.nodes;
      let newLinks = prev.links;
  
      // Nodes that already exist or are queued (same for 2D and 3D now)
      const nodeQueueIds = new Set(nodeQueue.current.map((n) => n.id));
      const allAvailableIds = new Set([...displayedNodeIds, ...nodeQueueIds]);
  
      // Total pending links at the start of this tick
      const totalPendingLinks = linkQueue.current.length;
  
      // Decide which links can be added now:
      // both endpoints must be either displayed or queued.
      const linksToAdd: GraphLink[] = [];
      const remainingLinks: GraphLink[] = [];
  
      for (const link of linkQueue.current) {
        const srcId = getSourceId(link);
        const tgtId = getTargetId(link);
  
        if (allAvailableIds.has(srcId) && allAvailableIds.has(tgtId)) {
          linksToAdd.push(link);
        } else {
          remainingLinks.push(link);
        }
      }
  
      // ───── Dynamic throttling ─────
      // We want to roughly clear the current queue in TARGET_TICKS_FOR_QUEUE ticks,
      // but never go below MIN_LINKS_PER_TICK or above MAX_LINKS_PER_TICK.
      const effectivePending = Math.max(totalPendingLinks, 1);
      const desiredPerTick = Math.ceil(
        effectivePending / TARGET_TICKS_FOR_QUEUE
      );
  
      const linksPerTick = Math.min(
        MAX_LINKS_PER_TICK,
        Math.max(MIN_LINKS_PER_TICK, desiredPerTick)
      );
  
      // Take up to linksPerTick eligible links this cycle
      const linksThisCycle = linksToAdd.slice(0, linksPerTick);
      const linksForLater = linksToAdd.slice(linksPerTick);
      linkQueue.current = [...linksForLater, ...remainingLinks];
  
      // Nodes that we actually need to bring in for the links we’re adding now
      const nodesNeededThisCycle = new Set<string>();
      for (const link of linksThisCycle) {
        const srcId = getSourceId(link);
        const tgtId = getTargetId(link);
        if (!displayedNodeIds.has(srcId)) nodesNeededThisCycle.add(srcId);
        if (!displayedNodeIds.has(tgtId)) nodesNeededThisCycle.add(tgtId);
      }
  
      // Lookup map for currently displayed nodes
      const displayedNodeMap = new Map<string, GraphNode>();
      for (const node of prev.nodes) {
        displayedNodeMap.set(node.id, node);
      }
  
      const positionNode = (node: GraphNode): GraphNode => {
        if (node.x !== undefined && node.y !== undefined) return node;
  
        const pos = calculateNodePosition(
          node.id,
          allValidLinks.current,
          displayedNodeMap,
          is3D
        );
  
        if (pos.x !== undefined) {
          const positioned = { ...node, ...pos };
          stableNodes.current.set(node.id, positioned);
          return positioned;
        }
  
        return node;
      };
  
      // Unified node queue handling for both 2D and 3D:
      // only add the nodes that are needed for the links we’re adding now.
      const nodesToAdd: GraphNode[] = [];
      const remainingNodes: GraphNode[] = [];
  
      for (const node of nodeQueue.current) {
        if (nodesNeededThisCycle.has(node.id)) {
          const positionedNode = positionNode(node);
          nodesToAdd.push(positionedNode);
          displayedNodeIds.add(node.id);
          displayedNodeMap.set(node.id, positionedNode);
        } else {
          remainingNodes.push(node);
        }
      }
  
      nodeQueue.current = remainingNodes;
  
      if (nodesToAdd.length > 0) {
        newNodes = [...newNodes, ...nodesToAdd];
      }
  
      // Add links and mark as pulsing
      if (linksThisCycle.length > 0) {
        newLinks = [...newLinks, ...linksThisCycle];
        const now = Date.now();
  
        for (const link of linksThisCycle) {
          const srcId = getSourceId(link);
          const linkKey = getLinkKey(link);
          pulsingNodes.current.set(srcId, now);
          pulsingLinks.current.set(linkKey, now);
        }
      }
  
      return { nodes: newNodes, links: newLinks };
    });
  
    // Continue processing while work remains
    if (nodeQueue.current.length > 0 || linkQueue.current.length > 0) {
      timerRef.current = setTimeout(processNextItem, 30);
    } else {
      timerRef.current = null;
    }
  }, [is3D]);
  

  // Rebuild state when input data changes
  useEffect(() => {
    // Count links per node
    const linkCount = new Map<string, number>();
    inputData.links.forEach((link: any) => {
      const src = link.source as string;
      const tgt = link.target as string;
      linkCount.set(src, (linkCount.get(src) || 0) + 1);
      linkCount.set(tgt, (linkCount.get(tgt) || 0) + 1);
    });

    // Build set of nodes that appear in any link
    const nodesWithLinks = new Set<string>();
    inputData.links.forEach((link: any) => {
      nodesWithLinks.add(link.source as string);
      nodesWithLinks.add(link.target as string);
    });

    // Filter nodes by min link count
    const connectedNodes = inputData.nodes.filter((n: any) => {
      const hasLinks = nodesWithLinks.has(n.id);
      const meetsMinCount = (linkCount.get(n.id) || 0) >= minLinkCount;
      return hasLinks && meetsMinCount;
    });

    const validNodeIds = new Set(connectedNodes.map((n: any) => n.id));

    // Filter links with both endpoints valid
    const validLinks: GraphLink[] = inputData.links.filter(
      (l: any) => validNodeIds.has(l.source) && validNodeIds.has(l.target)
    );

    allValidLinks.current = validLinks;

    const targetNodeIds = new Set(connectedNodes.map((n: any) => n.id));
    const targetLinkKeys = new Set(validLinks.map((l) => getLinkKey(l)));

    // Update / create nodes in stable storage
    const newNodes: GraphNode[] = [];
    for (const node of connectedNodes) {
      const id = node.id as string;

      if (!stableNodes.current.has(id)) {
        const newNode: GraphNode = { ...node };
        stableNodes.current.set(id, newNode);
        newNodes.push(newNode);
      } else {
        const existing = stableNodes.current.get(id)!;

        const preserved: Partial<GraphNode> = {
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy,
        };

        if (is3D) {
          preserved.z = existing.z;
          preserved.vz = existing.vz;
        }

        Object.assign(existing, { ...node, ...preserved });
      }
    }

    // Update / create links in stable storage
    const newLinks: GraphLink[] = [];
    for (const link of validLinks) {
      const key = getLinkKey(link);
      if (!stableLinks.current.has(key)) {
        const newLink = { ...link };
        stableLinks.current.set(key, newLink);
        newLinks.push(newLink);
      }
    }

    // Remove stale nodes
    const nodesToRemove = new Set<string>();
    stableNodes.current.forEach((_, id) => {
      if (!targetNodeIds.has(id)) {
        stableNodes.current.delete(id);
        nodesToRemove.add(id);
      }
    });

    // Remove stale links
    const linksToRemove = new Set<string>();
    stableLinks.current.forEach((_, key) => {
      if (!targetLinkKeys.has(key)) {
        stableLinks.current.delete(key);
        linksToRemove.add(key);
      }
    });

    if (nodesToRemove.size > 0 || linksToRemove.size > 0) {
      setDisplayedData((prev) => ({
        nodes: prev.nodes.filter((n) => !nodesToRemove.has(n.id)),
        links: prev.links.filter((l) => !linksToRemove.has(getLinkKey(l))),
      }));

      nodeQueue.current = nodeQueue.current.filter(
        (n) => !nodesToRemove.has(n.id)
      );
      linkQueue.current = linkQueue.current.filter(
        (l) => !linksToRemove.has(getLinkKey(l))
      );
    }

    // Ensure queues only contain still-valid items
    nodeQueue.current = nodeQueue.current.filter((n) =>
      targetNodeIds.has(n.id)
    );
    linkQueue.current = linkQueue.current.filter((l) =>
      targetLinkKeys.has(getLinkKey(l))
    );

    if (animate) {
      nodeQueue.current = nodeQueue.current.concat(newNodes);
      linkQueue.current = linkQueue.current.concat(newLinks);

      if (!timerRef.current && (newNodes.length > 0 || newLinks.length > 0)) {
        timerRef.current = setTimeout(processNextItem, 40);
      }
    } else if (newNodes.length > 0 || newLinks.length > 0) {
      setDisplayedData((prev) => ({
        nodes: [...prev.nodes, ...newNodes],
        links: [...prev.links, ...newLinks],
      }));
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [inputData, is3D, minLinkCount, animate, processNextItem]);

  // Pulse helpers
  const getPulseIntensity = useCallback((addedTime?: number) => {
    if (!addedTime) return 0;

    const elapsed = Date.now() - addedTime;
    if (elapsed > PULSE_DURATION) return 0;

    const progress = elapsed / PULSE_DURATION;
    // Oscillating pulse that decays over time
    return (
      Math.cos(progress * Math.PI * 3) * (1 - progress) * 0.5 +
      0.5 * (1 - progress)
    );
  }, []);

  const cleanupPulses = useCallback(() => {
    const now = Date.now();

    pulsingNodes.current.forEach((pulseTime, nodeId) => {
      if (now - pulseTime > PULSE_DURATION) {
        pulsingNodes.current.delete(nodeId);
      }
    });

    pulsingLinks.current.forEach((pulseTime, linkKey) => {
      if (now - pulseTime > PULSE_DURATION) {
        pulsingLinks.current.delete(linkKey);
      }
    });
  }, []);

  return {
    displayedData,
    pulsingNodes,
    pulsingLinks,
    getPulseIntensity,
    cleanupPulses,
  };
}

// ─────────────────────────────────────────────────────────────
// Graph algorithms
// ─────────────────────────────────────────────────────────────

export function findLargestCluster(
  nodes: GraphNode[],
  links: GraphLink[]
): GraphNode[] {
  if (nodes.length === 0) return [];

  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((n) => adjacency.set(n.id, new Set()));

  links.forEach((link) => {
    const srcId = getSourceId(link);
    const tgtId = getTargetId(link);
    adjacency.get(srcId)?.add(tgtId);
    adjacency.get(tgtId)?.add(srcId);
  });

  const visited = new Set<string>();
  const components: string[][] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const component: string[] = [];
    const queue = [node.id];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      component.push(current);

      adjacency.get(current)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      });
    }

    components.push(component);
  }

  const largest = components.reduce<string[]>(
    (max, comp) => (comp.length > max.length ? comp : max),
    []
  );

  const largestSet = new Set(largest);
  return nodes.filter((n) => largestSet.has(n.id));
}
