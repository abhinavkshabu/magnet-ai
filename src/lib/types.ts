import type { LucideIcon } from 'lucide-react';
import type { SuggestNextNodesOutput } from '@/ai/flows/suggest-next-nodes';

export type NodeType = 'webhook' | 'llm' | 'output' | 'logic' | 'iot' | 'api';

export type CanvasMode = 'select' | 'pan';

export type WorkflowNode = {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  position: {
    x: number;
    y: number;
  };
  content?: {
    url?: string;
    imageUrl?: string;
    imageHint?: string;
  };
};

export type WorkflowConnection = {
  id: string;
  from: string;
  to: string;
  prompt?: string;
};

export type NodeSuggestion = SuggestNextNodesOutput;

export type Connector = {
  nodeId: string;
  type: 'in' | 'out';
};
