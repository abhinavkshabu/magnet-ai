'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import Header from '@/components/layout/header';
import NodeLibrarySidebar from '@/components/layout/node-library-sidebar';
import AiCanvas from '@/components/canvas/ai-canvas';
import { initialNodes, initialConnections } from '@/lib/workflow-data';
import type { WorkflowNode, WorkflowConnection, NodeSuggestion } from '@/lib/types';
import { getSuggestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function AICanvasPage() {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NodeSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setSuggestions(null); // Clear suggestions when selection changes
  };

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
        title: "Workflow Executed",
        description: "The workflow simulation has completed.",
      });
    }, 2000 * connections.length); // Simulate execution time based on connection count
  };

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className="border-r border-border/80"
      >
        <NodeLibrarySidebar />
      </Sidebar>
      <SidebarInset className="min-h-screen flex flex-col">
        <Header
          onGetSuggestions={handleGetSuggestions}
          onRunWorkflow={handleRunWorkflow}
          isSuggesting={isSuggesting}
          isNodeSelected={!!selectedNodeId}
        />
        <main className="flex-1 relative overflow-hidden">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
