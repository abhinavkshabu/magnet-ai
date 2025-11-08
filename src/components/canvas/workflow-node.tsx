'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WorkflowNode, Connector, CanvasMode } from '@/lib/types';
import Image from 'next/image';

type WorkflowNodeProps = {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onStartConnection: (connector: Connector) => void;
  onEndConnection: (connector: Connector) => void;
  canvasMode: CanvasMode;
};

const NodeIcon = ({
  icon: Icon,
  type,
}: {
  icon: WorkflowNode['icon'];
  type: WorkflowNode['type'];
}) => {
  const colorClasses: Record<WorkflowNode['type'], string> = {
    webhook: 'bg-green-100 text-green-600',
    llm: 'bg-purple-100 text-purple-600',
    output: 'bg-blue-100 text-blue-600',
    logic: 'bg-yellow-100 text-yellow-600',
    iot: 'bg-pink-100 text-pink-600',
    api: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className={cn('p-1.5 rounded-md', colorClasses[type])}>
      <Icon className="w-4 h-4" />
    </div>
  );
};

export default function WorkflowNodeComponent({
  node,
  isSelected,
  onSelect,
  onStartConnection,
  onEndConnection,
  canvasMode
}: WorkflowNodeProps) {
  const Icon = node.icon;

  const handleConnectionMouseDown = (e: React.MouseEvent, type: 'in' | 'out') => {
    if (canvasMode !== 'select') return;
    e.stopPropagation();
    if (type === 'out') {
      onStartConnection({ nodeId: node.id, type: 'out' });
    }
  };
  
  const handleConnectionMouseUp = (e: React.MouseEvent, type: 'in' | 'out') => {
    if (canvasMode !== 'select') return;
    e.stopPropagation();
    if (type === 'in') {
      onEndConnection({ nodeId: node.id, type: 'in' });
    }
  };
  
  const handleNodeClick = (e: React.MouseEvent) => {
    if (canvasMode !== 'select') return;
    e.stopPropagation();
    onSelect(node.id);
  }

  return (
    <div
      className={cn(
        "absolute group workflow-node",
        canvasMode === 'select' ? 'cursor-pointer' : 'cursor-default pointer-events-none'
      )}
      style={{ top: `${node.position.y}px`, left: `${node.position.x}px` }}
      onClick={handleNodeClick}
    >
      <div
        className={cn(
          "absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-card border-2 border-border transition-colors",
          canvasMode === 'select' && "cursor-pointer hover:bg-primary pointer-events-auto"
        )}
        onMouseUp={(e) => handleConnectionMouseUp(e, 'in')}
      />
      <div
        className={cn(
          "absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-card border-2 border-border transition-colors",
          canvasMode === 'select' && "cursor-pointer hover:bg-primary pointer-events-auto"
        )}
        onMouseDown={(e) => handleConnectionMouseDown(e, 'out')}
      />
      
      <Card
        className={cn(
          'w-72 shadow-md rounded-xl transition-all duration-200',
           canvasMode === 'select' && 'hover:shadow-xl hover:-translate-y-0.5',
          isSelected
            ? 'ring-2 ring-primary/80 shadow-primary/20'
            : 'ring-1 ring-border'
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <NodeIcon icon={Icon} type={node.type} />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{node.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {node.description}
              </p>
            </div>
          </div>
          {node.content?.imageUrl && (
            <div className="mt-3 aspect-video rounded-md overflow-hidden relative">
              <Image
                src={node.content.imageUrl}
                alt={node.name}
                fill
                className="object-cover"
                data-ai-hint={node.content.imageHint}
              />
              {node.name.includes('Live Feed') && (
                 <>
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    LIVE
                  </div>
                   <div className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold">
                     REC
                   </div>
                 </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
