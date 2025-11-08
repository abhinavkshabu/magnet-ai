'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, MoveRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNode } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type WorkflowNodeProps = {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
};

export default function WorkflowNodeComponent({ node, isSelected, onSelect }: WorkflowNodeProps) {
  const { toast } = useToast();
  const Icon = node.icon;

  const handleCopy = () => {
    if (node.content?.url) {
      navigator.clipboard.writeText(node.content.url);
      toast({
        title: 'Copied to clipboard!',
        description: node.content.url,
      });
    }
  };

  return (
    <div
      className="absolute group"
      style={{ top: `${node.position.y}px`, left: `${node.position.x}px` }}
      onClick={() => onSelect(node.id)}
    >
      <Card
        className={cn(
          'w-72 h-[124px] cursor-pointer shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1',
          isSelected ? 'ring-2 ring-primary shadow-primary/20' : 'ring-1 ring-transparent'
        )}
      >
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className={cn('p-2 rounded-lg bg-secondary')}>
            <Icon className="w-6 h-6 text-secondary-foreground" />
          </div>
          <h3 className="font-headline text-lg font-semibold">{node.name}</h3>
        </CardHeader>
        <CardContent>
          {node.type === 'webhook' && node.content?.url ? (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={node.content.url}
                className="font-code text-xs h-8"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{node.description}</p>
          )}
        </CardContent>
      </Card>
      <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-card border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <MoveRight className="w-4 h-4 text-muted-foreground" />
      </div>
       <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-card border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      </div>
    </div>
  );
}
