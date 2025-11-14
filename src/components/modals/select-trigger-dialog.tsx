'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  X,
  Clock,
  Mail,
  FileUp,
  Rss,
  Zap,
} from 'lucide-react';
import { HttpIcon } from '@/components/icons/http-icon';
import { FormIcon } from '@/components/icons/form-icon';
import { ApiIcon } from '@/components/icons/api-icon';
import { cn } from '@/lib/utils';
import type { NodeType } from '@/lib/types';


const triggerCategories = ['All', 'By Schedule', 'By App', 'Webhooks', 'Manual'];

const triggerItems = [
  {
    icon: Clock,
    name: 'On a Schedule',
    description: 'Trigger this workflow at a specific time or interval.',
    category: 'By Schedule',
    type: 'webhook', // Placeholder type
  },
  {
    icon: HttpIcon,
    name: 'Webhook',
    description: 'Trigger when an external service sends an HTTP request.',
    category: 'Webhooks',
    type: 'webhook',
  },
  {
    icon: FormIcon,
    name: 'New Form Submission',
    description: 'Trigger when a new entry is submitted via a form.',
    category: 'By App',
    type: 'webhook', // Placeholder type
  },
  {
    icon: Mail,
    name: 'New Email Received',
    description: 'Trigger when a new email arrives in a specified inbox.',
    category: 'By App',
    type: 'webhook', // Placeholder type
  },
  {
    icon: FileUp,
    name: 'File Upload Detected',
    description: 'Trigger when a new file is uploaded to a specified directory.',
    category: 'By App',
    type: 'webhook', // Placeholder type
  },
  {
    icon: ApiIcon,
    name: 'API Call Received',
    description: 'Trigger upon a generic API request with custom payload.',
    category: 'Webhooks',
    type: 'api',
  },
  {
    icon: Rss,
    name: 'Scheduled Event (Advanced)',
    description: 'A more detailed scheduling option with cron job support.',
    category: 'By Schedule',
    type: 'webhook', // Placeholder type
  },
];

type SelectTriggerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (nodeDetails: { name: string, description: string, icon: React.ElementType, type: NodeType }) => void;
};

export default function SelectTriggerDialog({ open, onOpenChange, onAddNode }: SelectTriggerDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTriggers = triggerItems.filter(
    (trigger) =>
      (activeCategory === 'All' || trigger.category === activeCategory) &&
      trigger.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddClick = (trigger: typeof triggerItems[0]) => {
    onAddNode({
        name: trigger.name,
        description: trigger.description,
        icon: trigger.icon,
        type: trigger.type,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#171717] border-[#272727] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-medium">Select a Trigger</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6a6a6a]" />
            <Input
              placeholder="Search triggers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#272727] border-[#3a3a3a] pl-10 h-11 focus:ring-primary/50 text-base"
            />
          </div>
          <div className="flex items-center gap-2">
            {triggerCategories.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full text-sm",
                  activeCategory === cat
                    ? "bg-white text-black hover:bg-gray-200 hover:text-black"
                    : "text-[#a0a0a0] hover:bg-[#272727] hover:text-white"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
            {filteredTriggers.map((trigger) => (
              <div key={trigger.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#272727]">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#272727] rounded-full">
                    <trigger.icon className="h-5 w-5 text-[#a0a0a0]" />
                  </div>
                  <div>
                    <h3 className="font-medium">{trigger.name}</h3>
                    <p className="text-sm text-[#a0a0a0]">
                      {trigger.description}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" className="bg-[#272727] hover:bg-[#3a3a3a] text-white" onClick={() => handleAddClick(trigger)}>Add</Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
