import { Video, Bot, Image as ImageIcon, Webhook } from 'lucide-react';
import type { WorkflowNode, WorkflowConnection } from './types';

export const initialNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    name: 'Live Feed: Studio Camera 1',
    type: 'webhook',
    description: 'Capturing real-time footage for daily briefing.',
    icon: Video,
    position: { x: 200, y: 150 },
    content: {
      imageUrl: 'https://picsum.photos/seed/camera/600/400',
      imageHint: 'camera',
    },
  },
  {
    id: 'node-2',
    name: 'AI Model: Clip Extraction',
    type: 'llm',
    description: 'Automatically extracts key segments from raw video footage.',
    icon: Bot,
    position: { x: 450, y: 400 },
  },
  {
    id: 'node-3',
    name: 'Image: Extracted Thumbnail',
    type: 'output',
    description: 'A thumbnail from the extracted clip.',
    icon: ImageIcon,
    position: { x: 300, y: 650 },
    content: {
      imageUrl: 'https://picsum.photos/seed/thumbnail/600/400',
      imageHint: 'thumbnail',
    },
  },
];

export const initialConnections: WorkflowConnection[] = [
  { from: 'node-1', to: 'node-2' },
  { from: 'node-2', to: 'node-3' },
];
