import { Pencil } from 'lucide-react';
import type { WorkflowNode, WorkflowConnection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type NodeConnectorProps = {
  connection: WorkflowConnection;
  fromNode: WorkflowNode;
  toNode: WorkflowNode;
  nodeWidth: number;
  nodeHeight: number;
  isExecuting: boolean;
  isSelected: boolean;
  onSelect: (connection: WorkflowConnection) => void;
};

export default function NodeConnector({
  connection,
  fromNode,
  toNode,
  nodeWidth,
  nodeHeight,
  isExecuting,
  isSelected,
  onSelect,
}: NodeConnectorProps) {
  const [isHovered, setIsHovered] = useState(false);

  const x1 = fromNode.position.x + nodeWidth;
  const y1 = fromNode.position.y + nodeHeight / 2;
  const x2 = toNode.position.x;
  const y2 = toNode.position.y + nodeHeight / 2;

  const controlPointX1 = x1 + (x2 - x1) / 2;
  const controlPointY1 = y1;
  const controlPointX2 = x1 + (x2 - x1) / 2;
  const controlPointY2 = y2;
  
  // Midpoint calculation for a cubic Bezier curve at t=0.5
  const midX = (x1 + 3 * controlPointX1 + 3 * controlPointX2 + x2) / 8;
  const midY = (y1 + 3 * controlPointY1 + 3 * controlPointY2 + y2) / 8;

  const pathData = `M${x1},${y1} C ${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${x2},${y2}`;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(connection);
  };

  return (
    <g 
      className="group" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      style={{ pointerEvents: 'all' }}
    >
      <path d={pathData} stroke="transparent" strokeWidth="20" fill="none" onClick={handleSelect} className="cursor-pointer" />
      <path 
        d={pathData} 
        stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'} 
        strokeWidth="2" 
        fill="none" 
        className={cn("transition-colors", (isHovered || isSelected) && "stroke-primary")}
      />
      {isExecuting && (
        <path
          d={pathData}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="none"
          className="connector-path"
        />
      )}
       {(isHovered || isSelected) && (
        <g transform={`translate(${midX}, ${midY})`}>
          <foreignObject x="-12" y="-12" width="24" height="24" className="cursor-pointer pointer-events-auto" onClick={handleSelect}>
            <div className="w-6 h-6 bg-card border rounded-full flex items-center justify-center shadow-md hover:bg-accent">
                <Pencil className="w-3 h-3 text-muted-foreground" />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}
