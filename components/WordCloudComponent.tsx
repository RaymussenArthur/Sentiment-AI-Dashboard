'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

type WordCloudItem = {
  text: string;
  value: number;
  type: 'complaint' | 'praise';
};

export default function WordCloudComponent({ data }: { data: WordCloudItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous
    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Scale values to font sizes
    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    const fontScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([14, 60]);

    const layout = cloud()
      .size([width, height])
      .words(data.map(d => ({ ...d, size: fontScale(d.value) })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) * 90) - 45) // -45 or 45 degrees
      .font('Inter')
      .fontSize(d => d.size!)
      .on('end', draw);

    layout.start();

    function draw(words: any[]) {
      svg.selectAll('text')
        .data(words)
        .enter().append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Inter')
        .style('font-weight', '600')
        .style('fill', d => d.type === 'praise' ? '#10b981' : '#f43f5e') // emerald-500 for praise, rose-500 for complaint
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text(d => d.text)
        .style('opacity', 0)
        .transition()
        .duration(600)
        .style('opacity', 0.9);
    }

    const handleResize = () => {
      // Simple re-render on resize could be added here, but for simplicity we let it be static after render
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  return <div ref={containerRef} className="w-full h-full" />;
}
