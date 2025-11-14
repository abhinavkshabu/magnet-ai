'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Zap,
  GitFork,
  Database,
  Combine,
  Bot,
  Bell,
  File as FileIcon,
  MousePointer,
  Hand,
  Pencil,
  Webhook,
} from 'lucide-react';

import Header from '@/components/layout/header';
import AiCanvas from '@/components/canvas/ai-canvas';
import NodePropertiesSidebar from '@/components/layout/node-properties-sidebar';
import ConnectionPropertiesSidebar from '@/components/layout/connection-properties-sidebar';
import SelectTriggerDialog from '@/components/modals/select-trigger-dialog';
import { initialNodes, initialConnections } from '@/lib/workflow-data';
import type {
  WorkflowNode,
  WorkflowConnection,
  NodeSuggestion,
  Connector,
  CanvasMode,
  NodeType,
} from '@/lib/types';
import { getSuggestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const nodeCategories = [
  { icon: Zap, name: 'Trigger' },
  { icon: GitFork, name: 'Logic' },
  { icon: Database, name: 'Data' },
  { icon: Combine, name: 'Integrate' },
  { icon: Bot, name: 'AI Model' },
  { icon: Bell, name: 'Notify' },
  { icon: FileIcon, name: 'File I/O' },
];

export default function AICanvasPage() {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [connections, setConnections] =
    useState<WorkflowConnection[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] =
    useState<WorkflowConnection | null>(null);
  const [suggestions, setSuggestions] = useState<NodeSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('select');
  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);

  const handleDelete = () => {
    if (selectedNodeId) {
      setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
      setConnections((prev) =>
        prev.filter(
          (c) => c.from !== selectedNodeId && c.to !== selectedNodeId
        )
      );
      setSelectedNodeId(null);
    } else if (selectedConnection) {
      setConnections((prev) =>
        prev.filter((c) => c.id !== selectedConnection.id)
      );
      setSelectedConnection(null);
    } else {
      toast({
        title: 'Nothing selected',
        description: 'Please select a node or connection to delete.',
        variant: 'destructive',
      });
    }
  };

  const handleAddNode = (nodeDetails: { name: string, description: string, icon: React.ElementType, type: NodeType }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      name: nodeDetails.name,
      type: nodeDetails.type,
      description: nodeDetails.description,
      icon: nodeDetails.icon,
      position: { x: 400, y: 400 }, // Position should be more dynamic
      content: {}
    };

    if (nodeDetails.name === 'Webhook') {
        newNode.content = { url: 'https://api.example.com/webhook/123' };
        newNode.icon = Webhook;
    }

    setNodes(prev => [...prev, newNode]);
    setIsTriggerDialogOpen(false);
    // Maybe select the new node
    setTimeout(() => handleNodeSelect(newNode.id), 50);
  };
  
  const handleAddCustomNode = () => {
    handleAddNode({
        name: "Custom Node",
        description: "A custom node for your workflow.",
        icon: Pencil,
        type: 'api',
    });
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if user is typing in an input, textarea, etc.
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, selectedConnection]);

  const handleAddConnection = (from: Connector, to: Connector) => {
    // Avoid self-connections and duplicate connections
    if (from.nodeId === to.nodeId) return;
    const exists = connections.some(
      (c) => c.from === from.nodeId && c.to === to.nodeId
    );
    if (exists) return;

    setConnections((prev) => [
      ...prev,
      {
        id: `${from.nodeId}-${to.nodeId}`,
        from: from.nodeId,
        to: to.nodeId,
        prompt: '',
      },
    ]);
  };

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setSelectedConnection(null);
    setSuggestions(null); // Clear suggestions when selection changes
  };

  const handleConnectionSelect = (connection: WorkflowConnection | null) => {
    setSelectedConnection(connection);
    setSelectedNodeId(null);
  };

  const handleNodePositionChange = (
    nodeId: string,
    newPosition: { x: number; y: number }
  ) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId ? { ...node, position: newPosition } : node
      )
    );
  };

  const handleNodeUpdate = (
    nodeId: string,
    updates: Partial<Pick<WorkflowNode, 'name' | 'description'>>
  ) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  };

  const handleConnectionUpdate = (
    connectionId: string,
    updates: Partial<Pick<WorkflowConnection, 'prompt'>>
  ) => {
    setConnections((currentConnections) =>
      currentConnections.map((conn) =>
        conn.id === connectionId ? { ...conn, ...updates } : conn
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

  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === 'Trigger') {
      setIsTriggerDialogOpen(true);
    }
  };
  
  return (
    <>
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Header onRunWorkflow={handleRunWorkflow} onDelete={handleDelete} />
      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-card rounded-md border shadow-sm">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={canvasMode === 'select' ? 'secondary' : 'ghost'}
                      onClick={() => setCanvasMode('select')}
                    >
                      <MousePointer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select Tool (V)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={canvasMode === 'pan' ? 'secondary' : 'ghost'}
                      onClick={() => setCanvasMode('pan')}
                    >
                      <Hand className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pan Tool (H)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button size="icon" variant="outline" className="bg-card" onClick={handleAddCustomNode}>
              <Plus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 p-1 bg-card rounded-md border shadow-sm">
              {nodeCategories.map((cat) => (
                <Button key={cat.name} variant="ghost" className="gap-2" onClick={() => handleCategoryClick(cat.name)}>
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
            selectedConnectionId={selectedConnection?.id ?? null}
            onNodeSelect={handleNodeSelect}
            onConnectionSelect={handleConnectionSelect}
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
          onNodeUpdate={handleNodeUpdate}
        />
        <ConnectionPropertiesSidebar
          connection={selectedConnection}
          onClose={() => handleConnectionSelect(null)}
          onConnectionUpdate={handleConnectionUpdate}
        />
      </div>
    </div>
    <SelectTriggerDialog open={isTriggerDialogOpen} onOpenChange={setIsTriggerDialogOpen} onAddNode={handleAddNode} />
    </>
  );
}
