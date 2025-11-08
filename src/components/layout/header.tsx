'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BrainCircuit, Lightbulb, Play, Loader2 } from 'lucide-react';

type HeaderProps = {
  onRunWorkflow: () => void;
  onGetSuggestions: () => void;
  isSuggesting: boolean;
  isNodeSelected: boolean;
};

export default function Header({
  onRunWorkflow,
  onGetSuggestions,
  isSuggesting,
  isNodeSelected,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <BrainCircuit className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-bold tracking-tight">AI Canvas</h1>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onGetSuggestions}
          disabled={isSuggesting || !isNodeSelected}
        >
          {isSuggesting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Lightbulb />
          )}
          Suggest Next Step
        </Button>
        <Button onClick={onRunWorkflow}>
          <Play />
          Run Workflow
        </Button>
      </div>
    </header>
  );
}
