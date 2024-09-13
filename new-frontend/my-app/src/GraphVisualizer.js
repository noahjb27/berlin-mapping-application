import React, { useEffect, useRef, useState } from 'react';
import { fetchGraphData } from './api';
import * as d3 from 'd3';

const GraphVisualizer = ({ year }) => {
  const [data, setData] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const graphData = await fetchGraphData(year);
        setData(graphData);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchData();
  }, [year]);

  useEffect(() => {
    if (data) {
      // Clear previous drawing
      d3.select(svgRef.current).selectAll('*').remove();

      const width = 800;
      const height = 600;

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      const links = data.links;
      const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])));

      const linkElements = svg.selectAll('.link')
        .data(links)
        .enter().append('line')
        .attr('class', 'link')
        .attr('x1', d => d.source[0])
        .attr('y1', d => d.source[1])
        .attr('x2', d => d.target[0])
        .attr('y2', d => d.target[1])
        .attr('stroke', 'black');

      const nodeElements = svg.selectAll('.node')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .attr('r', 5)
        .attr('fill', 'red');
    }
  }, [data]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default GraphVisualizer;
