'use client';
import React, { useState, useRef, useCallback, MouseEvent } from 'react';
import type { WorkflowNode, WorkflowConnection, NodeSuggestion, Connector } from '@/lib/types';
import WorkflowNodeComponent from './workflow-node';
import NodeConnector from './node-connector';
import NodeSuggestions from './node-suggestions';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import MiniMap from './mini-map';

type AiCanvasProps = {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onAddConnection: (from: Connector, to: Connector) => void;
  suggestions: NodeSuggestion | null;
  isLoadingSuggestions: boolean;
  isExecuting: boolean;
};

const NODE_WIDTH = 288; // w-72
const NODE_HEIGHT = 124; // approx height
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const SCROLL_SENSITIVITY = 0.005;

export default function AiCanvas({
  nodes,
  connections,
  selectedNodeId,
  onNodeSelect,
  onAddConnection,
  suggestions,
  isLoadingSuggestions,
  isExecuting,
}: AiCanvasProps) {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 0.8 });
  const [isPanning, setIsPanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState<Connector | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { clientX, clientY, deltaY } = e;
    const rect = canvasRef.current!.getBoundingClientRect();
    const zoomFactor = 1 - deltaY * SCROLL_SENSITIVITY;
    
    const newZoom = Math.min(Math.max(view.zoom * zoomFactor, MIN_ZOOM), MAX_ZOOM);

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const newX = mouseX - (mouseX - view.x) * (newZoom / view.zoom);
    const newY = mouseY - (mouseY - view.y) * (newZoom / view.zoom);

    setView({ x: newX, y: newY, zoom: newZoom });
  };
  
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.workflow-node')) {
      panStart.current = { x: e.clientX - view.x, y: e.clientY - view.y };
      setIsPanning(true);
      e.stopPropagation();
    }
  }, [view.x, view.y]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const newPointerPos = {
      x: (e.clientX - rect.left - view.x) / view.zoom,
      y: (e.clientY - rect.top - view.y) / view.zoom
    };
    setPointerPos(newPointerPos);

    if (isPanning && canvasRef.current) {
      setView(v => ({...v, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y}));
    }
  }, [isPanning, view.x, view.y, view.zoom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
      if (isConnecting) setIsConnecting(null);
    }
  };

  const handleStartConnection = useCallback((connector: Connector) => {
    setIsConnecting(connector);
  }, []);
  
  const handleEndConnection = useCallback((connector: Connector) => {
    if (isConnecting) {
      onAddConnection(isConnecting, connector);
      setIsConnecting(null);
    }
  }, [isConnecting, onAddConnection]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const getConnectorPath = () => {
    if (!isConnecting) return "";
    const fromNode = nodes.find(n => n.id === isConnecting.nodeId);
    if (!fromNode) return "";
    
    const startX = fromNode.position.x + NODE_WIDTH;
    const startY = fromNode.position.y + NODE_HEIGHT / 2;
    const endX = pointerPos.x;
    const endY = pointerPos.y;

    const controlPointX1 = startX + (endX - startX) / 2;
    const controlPointY1 = startY;
    const controlPointX2 = startX + (endX - startX) / 2;
    const controlPointY2 = endY;

    return `M${startX},${startY} C ${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${endX},${endY}`;
  }


  return (
    <div
      ref={canvasRef}
      className={cn("w-full h-full relative overflow-hidden cursor-grab", isPanning && "cursor-grabbing")}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        backgroundSize: `${30 * view.zoom}px ${30 * view.zoom}px`,
        backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
    >
      <div style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: 'top left' }}>
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
          {isConnecting && (
            <path d={getConnectorPath()} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          )}
        </svg>

        {nodes.map((node) => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelect={onNodeSelect}
            onStartConnection={handleStartConnection}
            onEndConnection={handleEndConnection}
          />
        ))}
      </div>

      {selectedNode && (
        <NodeSuggestions
          node={selectedNode}
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          pan={{x: view.x, y: view.y}}
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
      <MiniMap nodes={nodes} view={view} setView={setView} nodeWidth={NODE_WIDTH} nodeHeight={NODE_HEIGHT} />
    </div>
  );
}
