'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import type { WorkflowNode } from '@/lib/types';
import { cn } from '@/lib/utils';

type NodePropertiesSidebarProps = {
  node: WorkflowNode | null;
  onClose: () => void;
  onGetSuggestions: () => void;
  isSuggesting: boolean;
};

export default function NodePropertiesSidebar({
  node,
  onClose,
  onGetSuggestions,
  isSuggesting,
}: NodePropertiesSidebarProps) {
  return (
    <aside
      className={cn(
        'w-96 border-l bg-card text-card-foreground transition-transform transform duration-300 ease-in-out',
        node ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="p-4 space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Node Properties</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {node ? (
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="node-name">Node Name</Label>
              <Input id="node-name" value={node.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={node.description}
                readOnly
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>Node Type</Label>
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize text-primary border-primary">
                  {node.type}
                </Badge>
                <Badge variant="outline">API</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Configuration</Label>
              {node.content?.url && (
                <div className="space-y-2">
                  <Label htmlFor="webhook-url" className="text-xs text-muted-foreground">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    readOnly
                    value={node.content.url}
                  />
                </div>
              )}
               <div className="space-y-2">
                <Label htmlFor="method" className="text-xs text-muted-foreground">Method</Label>
                <Select defaultValue="post">
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">POST</SelectItem>
                    <SelectItem value="get">GET</SelectItem>
                    <SelectItem value="put">PUT</SelectItem>
                    <SelectItem value="delete">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-primary" />
                 <h3 className="text-md font-semibold">AI Prompt Assistant</h3>
              </div>
               <Textarea
                placeholder="Ask the AI to generate or refine your node logic..."
                className="h-24"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onGetSuggestions} disabled={isSuggesting}>
                   {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Suggest Next Node
                </Button>
                 <Button variant="outline" size="sm">Explain Node</Button>
                 <Button variant="outline" size="sm">Refine Logic</Button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <BrainCircuit className="w-12 h-12 mb-4" />
            <p>Select a node to view its properties.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
