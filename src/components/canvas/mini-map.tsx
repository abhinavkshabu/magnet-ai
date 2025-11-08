'use client';
import React, { useRef, useState, useCallback, useEffect, MouseEvent } from 'react';
import { WorkflowNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Map, Minimize2, Maximize2 } from 'lucide-react';

const MAP_WIDTH = 250;
const MAP_HEIGHT = 150;

type MiniMapProps = {
  nodes: WorkflowNode[];
  view: { x: number; y: number; zoom: number };
  setView: React.Dispatch<React.SetStateAction<{ x: number; y: number; zoom: number }>>;
  nodeWidth: number;
  nodeHeight: number;
};

const MiniMap = ({ nodes, view, setView, nodeWidth, nodeHeight }: MiniMapProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [bounds, setBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  const [scale, setScale] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });
    const padding = 200;
    const newBounds = { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding };
    setBounds(newBounds);

    const scaleX = MAP_WIDTH / (newBounds.maxX - newBounds.minX);
    const scaleY = MAP_HEIGHT / (newBounds.maxY - newBounds.minY);
    setScale(Math.min(scaleX, scaleY));
  }, [nodes, nodeWidth, nodeHeight]);
  
  useEffect(() => {
      const canvasEl = document.querySelector('.w-full.h-full.relative.overflow-hidden');
      if (canvasEl) {
          const { width, height } = canvasEl.getBoundingClientRect();
          setViewportSize({ width, height });
      }
  }, []);

  const handleDrag = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newViewX = -( (x / scale) - (viewportSize.width / view.zoom / 2) ) * view.zoom;
    const newViewY = -( (y / scale) - (viewportSize.height / view.zoom / 2) ) * view.zoom;
    
    setView(v => ({...v, x: newViewX + bounds.minX * view.zoom, y: newViewY + bounds.minY * view.zoom }));
  };
  
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleDrag(e);
  };
  const handleMouseUp = () => setIsDragging(false);

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="absolute bottom-4 right-4 z-20 p-2 bg-card border rounded-md shadow-lg hover:bg-accent"
      >
        <Map className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  const viewportStyle = {
    width: (viewportSize.width / view.zoom) * scale,
    height: (viewportSize.height / view.zoom) * scale,
    left: (-view.x / view.zoom - bounds.minX) * scale,
    top: (-view.y / view.zoom - bounds.minY) * scale,
    transform: `translate(${(view.x / view.zoom) * scale}px, ${(view.y/view.zoom) * scale}px)`,
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 bg-card/80 backdrop-blur-sm border rounded-md shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="text-xs font-semibold text-muted-foreground">MINIMAP</h3>
        <button onClick={() => setIsExpanded(false)}>
          <Minimize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
      <div
        ref={mapRef}
        className="relative"
        style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleDrag}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute bg-muted-foreground/50 rounded-sm"
            style={{
              width: nodeWidth * scale,
              height: nodeHeight * scale,
              left: (node.position.x - bounds.minX) * scale,
              top: (node.position.y - bounds.minY) * scale,
            }}
          />
        ))}
        <div
            className="absolute border-2 border-primary/80 bg-primary/20 cursor-grab"
            style={viewportStyle}
        />
      </div>
    </div>
  );
};

export default MiniMap;
