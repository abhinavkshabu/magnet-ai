'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Lightbulb } from 'lucide-react';
import type { WorkflowNode, NodeSuggestion } from '@/lib/types';

type NodeSuggestionsProps = {
  node: WorkflowNode;
  suggestions: NodeSuggestion | null;
  isLoading: boolean;
  pan: { x: number; y: number };
};

export default function NodeSuggestions({ node, suggestions, isLoading, pan }: NodeSuggestionsProps) {
  const isOpen = isLoading || (suggestions !== null && suggestions.suggestedNodes.length > 0);

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <div
          style={{
            position: 'absolute',
            top: node.position.y,
            left: node.position.x,
            transform: `translate(${pan.x + 288}px, ${pan.y}px) translate(1rem, -50%)`,
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-80 border-primary/50 shadow-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
                <BrainCircuit className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg font-headline">AI Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Next steps based on '{node.name}'.
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2 pl-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          )}

          {suggestions && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-muted-foreground text-sm mb-2">Suggested Nodes:</h4>
                <ul className="space-y-1">
                  {suggestions.suggestedNodes.map((nodeName, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-primary/80" />
                        <span>{nodeName}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-muted-foreground text-sm mb-2">Reasoning:</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">
                  {suggestions.reasoning}
                </p>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
