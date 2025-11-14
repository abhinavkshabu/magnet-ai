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
  Trash2,
} from 'lucide-react';
import { LogoIcon } from '../icons/logo-icon';

type HeaderProps = {
  onRunWorkflow: () => void;
  onDelete: () => void;
};

export default function Header({ onRunWorkflow, onDelete }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <LogoIcon className="h-6 w-6 text-primary" />
        <h1 className="text-md font-semibold tracking-tight">
          Creative Sandbox
        </h1>
        <Button variant="ghost" size="icon" className="h-7 w-7 ml-1">
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 p-0.5 bg-card rounded-md border shadow-sm">
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 p-0.5 bg-card rounded-md border shadow-sm">
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-3.5 w-3.5" />
          Share
        </Button>
        <Button onClick={onRunWorkflow} size="sm" className="bg-primary hover:bg-primary/90">
          <Play className="mr-2 h-3.5 w-3.5" />
          Deploy
        </Button>
      </div>
    </header>
  );
}
