import type { WorkflowNode } from '@/lib/types';
import { cn } from '@/lib/utils';

type NodeConnectorProps = {
  fromNode: WorkflowNode;
  toNode: WorkflowNode;
  nodeWidth: number;
  nodeHeight: number;
  isExecuting: boolean;
};

export default function NodeConnector({
  fromNode,
  toNode,
  nodeWidth,
  nodeHeight,
  isExecuting,
}: NodeConnectorProps) {
  const x1 = fromNode.position.x + nodeWidth;
  const y1 = fromNode.position.y + nodeHeight / 2;
  const x2 = toNode.position.x;
  const y2 = toNode.position.y + nodeHeight / 2;

  const controlPointX1 = x1 + (x2 - x1) / 2;
  const controlPointY1 = y1;
  const controlPointX2 = x1 + (x2 - x1) / 2;
  const controlPointY2 = y2;

  const pathData = `M${x1},${y1} C ${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${x2},${y2}`;

  return (
    <g>
      <path d={pathData} stroke="hsl(var(--border))" strokeWidth="2" fill="none" />
      {isExecuting && (
        <path
          d={pathData}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="none"
          className="connector-path"
        />
      )}
    </g>
  );
}
