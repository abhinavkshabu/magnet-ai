'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, GitMerge, Sparkles } from 'lucide-react';
import type { WorkflowConnection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type ConnectionPropertiesSidebarProps = {
  connection: WorkflowConnection | null;
  onClose: () => void;
  onConnectionUpdate: (connectionId: string, updates: Partial<Pick<WorkflowConnection, 'prompt'>>) => void;
};

export default function ConnectionPropertiesSidebar({
  connection,
  onClose,
  onConnectionUpdate,
}: ConnectionPropertiesSidebarProps) {
  const [prompt, setPrompt] = useState(connection?.prompt || '');

  useEffect(() => {
    if (connection) {
      setPrompt(connection.prompt || '');
    }
  }, [connection]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleBlur = () => {
    if (connection) {
      onConnectionUpdate(connection.id, { prompt });
    }
  };

  return (
    <aside
      className={cn(
        'absolute top-0 right-0 h-full w-96 border-l bg-card text-card-foreground transition-transform transform duration-300 ease-in-out z-30',
        connection ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="p-4 space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Branch Properties</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {connection ? (
          <div className="space-y-4 flex-1">
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-primary" />
                 <h3 className="text-md font-semibold">AI Branch Condition</h3>
              </div>
               <Textarea
                placeholder="e.g., 'If the extracted clip contains a person, then...' "
                className="h-36"
                value={prompt}
                onChange={handlePromptChange}
                onBlur={handleBlur}
              />
              <p className="text-xs text-muted-foreground">
                Describe the condition or logic for this branch. The AI will use this prompt to determine if the workflow should proceed down this path.
              </p>
              <div className="flex flex-wrap gap-2">
                 <Button variant="outline" size="sm">Generate with AI</Button>
                 <Button variant="outline" size="sm">Validate Logic</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <GitMerge className="w-12 h-12 mb-4" />
            <p>Select a branch to edit its properties.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
