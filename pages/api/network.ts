import { getAllCacheUrl, getCacheUrl } from "@utils/cache";
import * as d3 from "d3";
import { CacheOptions } from "hooks/useCache";
import jsdom from "jsdom";
import { Transaction } from "models/Transaction";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  getNodesAndLinks,
  renderNetworkGraph,
} from "./../../utils/render_graph";

// create a new JSDOM instance for d3-selection to use

async function fetcher(options: CacheOptions) {
  let url: string;
  if (options.address) {
    url = getCacheUrl(options.address, options.limit, options.offset);
  } else {
    url = getAllCacheUrl(options);
  }
  const response = await fetch(url);
  const data = await response.json();
  return data?.data as Transaction[];
}
function optionsFromQuery(query): CacheOptions {
  const address = query?.address ? query.address : undefined;

  const limit = query?.limit ? parseInt(query.limit) : 300000;
  const offset = query?.offset ? parseInt(query.offset) : undefined;
  const blockOffset = query?.blockOffset
    ? parseInt(query.blockOffset)
    : undefined;
  return { address, limit, offset, blockOffset };
}
async function render(svg, nodesAndLinks) {
  return new Promise((resolve, reject) => {
    // TODO add onError
    renderNetworkGraph(svg, nodesAndLinks, {
      interactive: false,
      onSimulationComplete: () => {
        resolve(document.body.innerHTML);
      },
    });
  });
}

// and so on
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const dom = new jsdom.JSDOM("<svg></svg>", {
    pretendToBeVisual: true,
    runScripts: "dangerously",
  });
  await new Promise((resolve) => dom.window.addEventListener("load", resolve));

  global.document = dom.window.document;
  const options = optionsFromQuery(req.query);
  const data = await fetcher(options);
  d3.select(dom.window.document); //get d3 into the dom
  const svg = d3.select<d3.BaseType, SVGElement>("svg");

  const nodesAndLinks = getNodesAndLinks(data);
  const document = await render(svg, nodesAndLinks);
  res.setHeader("Content-Type", "image/svg+xml");
  res.write(document);
  res.end();
};
