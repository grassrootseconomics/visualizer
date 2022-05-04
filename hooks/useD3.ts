import React from 'react';
import * as d3 from 'd3';

export const useD3 = (renderChartFn: (svg: d3.Selection<d3.BaseType, SVGElement, HTMLElement, any>)=>void, dependencies) => {
    const ref = React.useRef();

    React.useEffect(() => {
        renderChartFn(d3.select<d3.BaseType, SVGElement>(ref.current));
        return () => {};
      }, dependencies);
    return ref;
}