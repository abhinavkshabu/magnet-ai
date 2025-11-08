'use client';

import { useState } from 'react';
import {
  Plus,
  Zap,
  GitFork,
  Database,
  Combine,
  Bot,
  Bell,
  File,
} from 'lucide-react';

import Header from '@/components/layout/header';
import AiCanvas from '@/components/canvas/ai-canvas';
import NodePropertiesSidebar from '@/components/layout/node-properties-sidebar';
import { initialNodes, initialConnections } from '@/lib/workflow-data';
import type {
  WorkflowNode,
  WorkflowConnection,
  NodeSuggestion,
} from '@/lib/types';
import { getSuggestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const nodeCategories = [
  { icon: Zap, name: 'Trigger' },
  { icon: GitFork, name: 'Logic' },
  { icon: Database, name: 'Data' },
  { icon: Combine, name: 'Integrate' },
  { icon: Bot, name: 'AI Model' },
  { icon: Bell, name: 'Notify' },
  { icon: File, name: 'File I/O' },
];

export default function AICanvasPage() {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [connections, setConnections] =
    useState<WorkflowConnection[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NodeSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setSuggestions(null); // Clear suggestions when selection changes
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const handleGetSuggestions = async () => {
    if (!selectedNodeId) {
      toast({
        title: 'No node selected',
        description: 'Please select a node to get suggestions.',
        variant: 'destructive',
      });
      return;
    }

    setIsSuggesting(true);
    setSuggestions(null);

    const currentNode = nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;

    try {
      const result = await getSuggestions({
        existingNodes: nodes.map((n) => n.name),
        currentNode: currentNode.name,
      });
      setSuggestions(result);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch AI suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleRunWorkflow = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      toast({
        title: 'Workflow Executed',
        description: 'The workflow simulation has completed.',
      });
    }, 2000 * connections.length); // Simulate execution time based on connection count
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onRunWorkflow={handleRunWorkflow} />
      <div className="flex-1 flex">
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Button size="icon" variant="outline" className="bg-card">
              <Plus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 p-1 bg-card rounded-md border shadow-sm">
              {nodeCategories.map((cat) => (
                <Button key={cat.name} variant="ghost" className="gap-2">
                  <cat.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cat.name}</span>
                </Button>
              ))}
            </div>
          </div>
          <AiCanvas
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            suggestions={suggestions}
            isLoadingSuggestions={isSuggesting}
            isExecuting={isExecuting}
          />
        </main>
        <NodePropertiesSidebar
          node={selectedNode}
          onClose={() => handleNodeSelect(null)}
          onGetSuggestions={handleGetSuggestions}
          isSuggesting={isSuggesting}
        />
      </div>
    </div>
  );
}
