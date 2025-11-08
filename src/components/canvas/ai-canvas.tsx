'use client';
import React, { useState, useRef, useCallback } from 'react';
import type { WorkflowNode, WorkflowConnection, NodeSuggestion } from '@/lib/types';
import WorkflowNodeComponent from './workflow-node';
import NodeConnector from './node-connector';
import NodeSuggestions from './node-suggestions';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type AiCanvasProps = {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  suggestions: NodeSuggestion | null;
  isLoadingSuggestions: boolean;
  isExecuting: boolean;
};

const NODE_WIDTH = 288; // w-72
const NODE_HEIGHT = 124; // approx height

export default function AiCanvas({
  nodes,
  connections,
  selectedNodeId,
  onNodeSelect,
  suggestions,
  isLoadingSuggestions,
  isExecuting,
}: AiCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    setIsPanning(true);
    e.stopPropagation();
  }, [pan.x, pan.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !canvasRef.current) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is on the canvas itself and not on a node or other element.
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
    }
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <div
      ref={canvasRef}
      className={cn("w-full h-full relative overflow-hidden cursor-grab", isPanning && "cursor-grabbing")}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        backgroundSize: '30px 30px',
        backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none">
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            return (
              <NodeConnector
                key={`${conn.from}-${conn.to}`}
                fromNode={fromNode}
                toNode={toNode}
                nodeWidth={NODE_WIDTH}
                nodeHeight={NODE_HEIGHT}
                isExecuting={isExecuting}
              />
            );
          })}
        </svg>

        {nodes.map((node) => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelect={onNodeSelect}
          />
        ))}
      </div>

      {selectedNode && (
        <NodeSuggestions
          node={selectedNode}
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          pan={pan}
        />
      )}
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md">
        <div className="relative">
          <Input 
            placeholder="Ask AI to suggest nodes, connect paths, or explore 'what-if' scenarios"
            className="w-full rounded-full shadow-lg h-12 px-6 pr-12 text-base"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
