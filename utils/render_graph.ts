import { Link, Node } from "@components/network-graph";
import * as d3 from "d3";
import { Transaction } from "models/Transaction";
export interface RenderGraphOptions {
  interactive?: boolean;
  onLoaded?: (error?: string) => void;
  onNodeClick?: (node: Node) => void;
  onSimulationComplete?: () => void;

  nodeId?: any;
  nodeGroup?: any;
  nodeGroups?: any;
  nodeTitle?: any;
  nodeFill?: any;
  nodeStroke?: any;
  nodeStrokeWidth?: any;
  nodeStrokeOpacity?: any;
  nodeRadius?: any;
  nodeStrength?: any;
  linkSource?: any;
  linkTarget?: any;
  linkStroke?: any;
  linkStrokeOpacity?: any;
  linkStrokeWidth?: any;
  linkStrokeLinecap?: any;
  linkStrength?: any;
  colors?: readonly string[];
  width?: any;
  height?: any;
  invalidation?: any;
}
const defaultOptions: RenderGraphOptions = {
  interactive: true,
  onSimulationComplete: () => {},
  onLoaded: (error) => {},
  nodeId: (d: { id: any }) => d.id, // given d in nodes, returns a unique identifier (string)
  nodeGroup: null, // given d in nodes, returns an (ordinal) value for color
  nodeGroups: null, // an array of ordinal values representing the node groups
  nodeTitle: undefined, // given d in nodes, a title string
  nodeFill: "currentColor", // node stroke fill (if not using a group color encoding)
  nodeStroke: "#fff", // node stroke color
  nodeStrokeWidth: 0, // node stroke width, in pixels
  nodeStrokeOpacity: 1, // node stroke opacity
  nodeRadius: (d: { value: number }) => d.value / 100, // node radius, in pixels
  nodeStrength: (d: { value: any }) => d.value,
  linkSource: ({ source }) => source, // given d in links, returns a node identifier string
  linkTarget: ({ target }) => target, // given d in links, returns a node identifier string
  linkStroke: "#999", // link stroke color
  linkStrokeOpacity: 0.6, // link stroke opacity
  linkStrokeWidth: 0.5, // given d in links, returns a stroke width in pixels
  linkStrokeLinecap: "round", // link stroke linecap
  linkStrength: null,
  colors: d3.schemeTableau10, // an array of color strings, for the node groups
  width: 1000, // outer width, in pixels
  height: 1000, // outer height, in pixels
  invalidation: null, // when this promise resolves, stop the simulation
};
export interface NetworkGraphData {
  nodes: Node[];
  links: Link[];
}
export const renderNetworkGraph = (
  svg: d3.Selection<d3.BaseType, SVGElement, HTMLElement, any>,
  data: NetworkGraphData,
  options: RenderGraphOptions
) => {
  options = { ...defaultOptions, ...options };
  const {
    onLoaded,
    nodeId,
    linkTarget,
    linkSource,
    nodeGroup,
    linkStrokeWidth,
    colors,
  } = options;
  let { nodeTitle, nodeGroups } = options;

  const N = d3.map(data.nodes, nodeId).map(intern);
  const LS = d3.map(data.links, linkSource).map(intern);
  const LT = d3.map(data.links, linkTarget).map(intern);
  if (nodeTitle === undefined)
    nodeTitle = (node: { id: any }, i: any) => node.id;
  const T = nodeTitle == null ? null : d3.map(data.nodes, nodeTitle);
  const G =
    nodeGroup == null ? null : d3.map(data.nodes, nodeGroup).map(intern);
  const W =
    typeof linkStrokeWidth !== "function"
      ? null
      : d3.map(data.links, linkStrokeWidth);

  // Replace the input nodes and links with mutable objects for the simulation.
  const nodes = d3.map(data.nodes, (node, i) => ({
    id: N[i],
    value: node.value,
  }));
  const links = d3.map(data.links, (link, i) => ({
    source: LS[i],
    target: LT[i],
    token: link.token,
    value: link.value,
  }));

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
  const nodes_domain = d3.extent(nodes, function (d) {
    return d.value;
  });
  const links_domain = d3.extent(links, function (d) {
    return d.value;
  });
  const nodeChargeScale = d3.scalePow().domain(nodes_domain).range([100, 200]);
  const nodeSizeScale = d3.scalePow().domain(nodes_domain).range([2, 100]);
  const linkStrengthScale = d3.scalePow().domain(links_domain).range([1, 2]);
  
  const nodeCharge = d3.forceManyBody().strength((d) => {
    return -nodeChargeScale((d as Node).value);
  });
  const forceLink = d3
    .forceLink(links)
    .id(({ index: i }) => N[i])
    .distance(function (d) {
      return d.value * 1;
    })
    .strength((d) => {
      return linkStrengthScale(d.value);
    });
  function handleZoom(e: {
    transform:
      | string
      | number
      | boolean
      | readonly (string | number)[]
      | d3.ValueFn<
          d3.BaseType,
          unknown,
          string | number | boolean | readonly (string | number)[]
        >;
  }) {
    svg.selectAll("g").attr("transform", e.transform);
  }
  if (options.interactive) {
    const zoom = d3.zoom().on("zoom", handleZoom);
    svg.call(zoom as any);
  }
  onLoaded();
  const simulation = d3
    .forceSimulation(nodes as any)
    .force("link", forceLink)
    .force("charge", nodeCharge)
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", ticked)
    .on("end", options.onSimulationComplete);
  svg.selectAll("*").remove();
  svg
    .attr("width", options.width)
    .attr("height", options.height)
    .attr("viewBox", [
      -options.width / 2,
      -options.height / 2,
      options.width,
      options.height,
    ])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const link = svg
    .append("g")
    .attr("stroke", options.linkStroke)
    .attr("stroke-opacity", options.linkStrokeOpacity)
    .attr(
      "stroke-width",
      typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null
    )
    .attr("stroke-linecap", options.linkStrokeLinecap)
    .selectAll("line")
    .data(links)
    .join("line");

  if (W) link.attr("stroke-width", ({ index: i }: any) => W[i] as any);

  const node = svg
    .append("g")
    .attr("fill", options.nodeFill)
    .attr("stroke", options.nodeStroke)
    .attr("stroke-opacity", options.nodeStrokeOpacity)
    .attr("stroke-width", options.nodeStrokeWidth)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => 2 * nodeSizeScale(options.nodeRadius(d)));
  if (options.interactive) {
    node.call(drag(simulation) as any).on("click", (d, n: Node) => {
      options.onNodeClick(n);
    });
  }

  if (G) node.attr("fill", ({ index: i }: any) => color(G[i]));
  if (T) node.append("title").text(({ index: i }: any) => T[i] as any);

  // Handle invalidation.
  if (options.invalidation != null)
    options.invalidation.then(() => simulation.stop());

  function intern(value: { valueOf: () => any }) {
    return value !== null && typeof value === "object"
      ? value.valueOf()
      : value;
  }

  function ticked() {
    link
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);

    node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
  }

  function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
    function dragstarted(event: {
      active: any;
      subject: { fx: any; x: any; fy: any; y: any };
    }) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: { subject: { fx: any; fy: any }; x: any; y: any }) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: { active: any; subject: { fx: any; fy: any } }) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
  return Object.assign(svg.node(), { scales: { color } });
};
const faucets = [
  // "cd9fd1e71F684cfb30fA34831ED7ED59f6f77469",
  // "59a5E2fAF8163fE24cA006a221dD0f34c5e0Cb41",
  // "289DeFD53E2D96F05Ba29EbBebD9806C94d04Cb6",
  // "cA5DA01B6Dac771c8F3625AA1a8931E7DAC41832"
];

export const getNodesAndLinks = (transactions: Transaction[]) => {
  const addresses = new Set<string>();
  const links = [];
  for (const tx of transactions) {
    if (!faucets.includes(tx.sender) && !faucets.includes(tx.recipient)) {
      const exsisteingLinkIndex = links.findIndex(
        (predicate) =>
          predicate.source === tx.sender && predicate.target === tx.recipient
      );
      if (exsisteingLinkIndex === -1) {
        links.push({
          source: tx.sender,
          target: tx.recipient,
          token: tx.source_token,
          value: 1,
        });
      } else {
        links[exsisteingLinkIndex].value++;
      }

      addresses.add(tx.sender);
      addresses.add(tx.recipient);
    }
  }
  return {
    links,
    nodes: [...addresses].map((address) => {
      return {
        id: address,
        group: 1,
        value: transactions.reduce((acc, v) => {
          if (v.sender === address) {
            acc = acc + 1;
          }
          if (v.recipient === address) {
            acc = acc + 1;
          }
          return acc;
        }, 1),
      };
    }),
  };
};
