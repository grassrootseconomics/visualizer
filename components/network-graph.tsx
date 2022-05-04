import * as d3 from "d3";
import { useD3 } from "hooks/useD3";
import { useRouter } from "next/router";
import React from "react";
export type Link = {
  source: string;
  target: string;
  token: string;
  value: number;
};
export type Node = {
  id: string;
  group: number;
  value: number;
};
export function NetworkGraph(
  { nodes, links }: { nodes: Node[]; links: Link[] },
  {
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup = null, // given d in nodes, returns an (ordinal) value for color
    nodeGroups = null, // an array of ordinal values representing the node groups
    nodeTitle = undefined, // given d in nodes, a title string
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 0, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = (d) => d.value / 100, // node radius, in pixels
    nodeStrength = (d) => d.value,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 0.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength = null,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = window.innerWidth, // outer width, in pixels
    height = window.innerHeight, // outer height, in pixels
    invalidation = null, // when this promise resolves, stop the simulation
  } = {}
) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const renderGraph = (
    svg: d3.Selection<d3.BaseType, SVGElement, HTMLElement, any>
  ) => {
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (node, i) => node.id;
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W =
      typeof linkStrokeWidth !== "function"
        ? null
        : d3.map(links, linkStrokeWidth);

    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (node, i) => ({
      id: N[i],
      value: node.value,
    })) as any;
    links = d3.map(links, (link, i) => ({
      source: LS[i],
      target: LT[i],
      token: link.token,
      value: link.value,
    })) as any;

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    const color =
      nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
    const nodes_domain = d3.extent(nodes, function (d) {
      return d.value;
    });
    const links_domain = d3.extent(links, function (d) {
      return d.value;
    });
    const weightScaleNodeForce = d3
      .scalePow()
      .domain(nodes_domain)
      .range([20, 50]);

    const weightScaleNodeSize = d3
      .scalePow()
      .domain(nodes_domain)
      .range([2, 100]);

    const weightScale = d3.scalePow().domain(links_domain).range([1, 2]);
    // Construct the forces.
    const forceNode = d3.forceManyBody().strength((d) => {
      return -weightScaleNodeForce((d as Node).value);
    });
    const forceLink = d3
      .forceLink(links)
      .id(({ index: i }) => N[i])
      .distance(function (d) {
        return d.value * 1;
      })
      .strength((d) => {
        return weightScale(d.value);
      });
    function handleZoom(e) {
      svg.selectAll("g").attr("transform", e.transform);
    }
    const zoom = d3.zoom().on("zoom", handleZoom);
    svg.call(zoom as any);
    setLoading(false);
    const simulation = d3
      .forceSimulation(nodes as any)
      .force("link", forceLink)
      .force("charge", forceNode)
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .on("tick", ticked);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const link = svg
      .append("g")
      .attr("stroke", linkStroke)
      .attr("stroke-opacity", linkStrokeOpacity)
      .attr(
        "stroke-width",
        typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null
      )
      .attr("stroke-linecap", linkStrokeLinecap)
      .selectAll("line")
      .data(links)
      .join("line");

    if (W) link.attr("stroke-width", ({ index: i }: any) => W[i] as any);

    const node = svg
      .append("g")
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-opacity", nodeStrokeOpacity)
      .attr("stroke-width", nodeStrokeWidth)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => 2 * weightScaleNodeSize(nodeRadius(d)))
      .call(drag(simulation) as any);

    node.on("click", (d, n) => {
      router.push({
        pathname: `/transactions`,
        query: {
          address: `0x${n.id}`,
        },
      });
    });

    if (G) node.attr("fill", ({ index: i }: any) => color(G[i]));
    if (T) node.append("title").text(({ index: i }: any) => T[i] as any);

    // Handle invalidation.
    if (invalidation != null) invalidation.then(() => simulation.stop());

    function intern(value) {
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

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
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
  const ref = useD3(renderGraph, [nodes, links]);

  return (
    <>
      <svg
        ref={ref}
        style={{
          height: 500,
          width: "100%",
          marginRight: "0px",
          marginLeft: "0px",
        }}
      ></svg>
    </>
  );
}
