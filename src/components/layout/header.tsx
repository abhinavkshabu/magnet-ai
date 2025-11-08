'use client';

import { Button } from '@/components/ui/button';
import {
  Undo,
  Redo,
  Search,
  ZoomIn,
  Share2,
  Play,
  Pencil,
} from 'lucide-react';
import { LogoIcon } from '../icons/logo-icon';

type HeaderProps = {
  onRunWorkflow: () => void;
};

export default function Header({ onRunWorkflow }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <LogoIcon className="h-7 w-7 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">
          Creative Sandbox
        </h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 p-1 bg-card rounded-md border shadow-sm">
        <Button variant="ghost" size="icon">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 p-1 bg-card rounded-md border shadow-sm">
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button onClick={onRunWorkflow} className="bg-primary hover:bg-primary/90">
          <Play className="mr-2 h-4 w-4" />
          Deploy
        </Button>
      </div>
    </header>
  );
}
