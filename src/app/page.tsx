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
  MousePointer,
  Hand,
} from 'lucide-react';

import Header from '@/components/layout/header';
import AiCanvas from '@/components/canvas/ai-canvas';
import NodePropertiesSidebar from '@/components/layout/node-properties-sidebar';
import { initialNodes, initialConnections } from '@/lib/workflow-data';
import type {
  WorkflowNode,
  WorkflowConnection,
  NodeSuggestion,
  Connector,
  CanvasMode,
} from '@/lib/types';
import { getSuggestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('select');


  const handleAddConnection = (from: Connector, to: Connector) => {
    // Avoid self-connections and duplicate connections
    if (from.nodeId === to.nodeId) return;
    const exists = connections.some(
      (c) => c.from === from.nodeId && c.to === to.nodeId
    );
    if (exists) return;

    setConnections((prev) => [...prev, { from: from.nodeId, to: to.nodeId }]);
  };


  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setSuggestions(null); // Clear suggestions when selection changes
  };
  
  const handleNodePositionChange = (nodeId: string, newPosition: { x: number, y: number }) => {
    setNodes(currentNodes => 
      currentNodes.map(node => 
        node.id === nodeId ? { ...node, position: newPosition } : node
      )
    );
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
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Header onRunWorkflow={handleRunWorkflow} />
      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-card rounded-md border shadow-sm">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant={canvasMode === 'select' ? 'secondary' : 'ghost'} onClick={() => setCanvasMode('select')}>
                        <MousePointer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select Tool (V)</p>
                    </TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                       <Button size="icon" variant={canvasMode === 'pan' ? 'secondary' : 'ghost'} onClick={() => setCanvasMode('pan')}>
                        <Hand className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pan Tool (H)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
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
            onAddConnection={handleAddConnection}
            onNodePositionChange={handleNodePositionChange}
            suggestions={suggestions}
            isLoadingSuggestions={isSuggesting}
            isExecuting={isExecuting}
            canvasMode={canvasMode}
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
