import { Webhook, Bot, Mail } from 'lucide-react';
import type { WorkflowNode, WorkflowConnection } from './types';

export const initialNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    name: 'Webhook Trigger',
    type: 'webhook',
    description: 'Triggers on incoming HTTP request.',
    icon: Webhook,
    position: { x: 100, y: 200 },
    content: {
      url: 'https://api.example.com/webhook/123',
    },
  },
  {
    id: 'node-2',
    name: 'Generate Text',
    type: 'llm',
    description: 'Generates text using an AI model.',
    icon: Bot,
    position: { x: 480, y: 200 },
  },
  {
    id: 'node-3',
    name: 'Send Email',
    type: 'output',
    description: 'Sends the result via email.',
    icon: Mail,
    position: { x: 860, y: 200 },
  },
];

export const initialConnections: WorkflowConnection[] = [
  { from: 'node-1', to: 'node-2' },
  { from: 'node-2', to: 'node-3' },
];
