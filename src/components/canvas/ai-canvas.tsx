'use client';

import type { WorkflowNode, WorkflowConnection, NodeSuggestion } from '@/lib/types';
import WorkflowNodeComponent from './workflow-node';
import NodeConnector from './node-connector';
import NodeSuggestions from './node-suggestions';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

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
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is on the canvas itself and not on a node or other element.
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
    }
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <div
      className="w-full h-full relative bg-grid"
      onClick={handleCanvasClick}
      style={{
        backgroundSize: '30px 30px',
        backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
      }}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
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

      {selectedNode && (
        <NodeSuggestions
          node={selectedNode}
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
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
