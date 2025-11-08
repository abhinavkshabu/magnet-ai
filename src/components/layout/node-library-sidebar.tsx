import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Webhook,
  Clock,
  Bot,
  Camera,
  Mic,
  GitFork,
  Timer,
  Thermometer,
  Lightbulb,
  Mail,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Armchair } from 'lucide-react'; // Using as proxy for Robot Arm
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { OpenAIIcon } from '@/components/icons/openai-icon';
import { GeminiIcon } from '@/components/icons/gemini-icon';
import { GroqIcon } from '@/components/icons/groq-icon';

const nodeCategories = [
  {
    label: 'Triggers',
    nodes: [
      { icon: Webhook, name: 'Webhook', tooltip: 'Trigger via HTTP' },
      { icon: Clock, name: 'Schedule', tooltip: 'Trigger on a schedule' },
    ],
  },
  {
    label: 'AI / ML',
    nodes: [
      { icon: Bot, name: 'Generate Text', tooltip: 'Text generation model' },
      { icon: Camera, name: 'Analyze Image', tooltip: 'Image analysis model' },
      { icon: Mic, name: 'Speech-to-Text', tooltip: 'Transcribe audio' },
      { icon: OpenAIIcon, name: 'OpenAI', tooltip: 'Use OpenAI models' },
      { icon: GeminiIcon, name: 'Gemini', tooltip: 'Use Gemini models' },
      { icon: GroqIcon, name: 'Groq', tooltip: 'Use Groq models' },
    ],
  },
  {
    label: 'Logic',
    nodes: [
      { icon: GitFork, name: 'Condition', tooltip: 'Branch workflow' },
      { icon: Timer, name: 'Delay', tooltip: 'Wait for a period' },
    ],
  },
  {
    label: 'IoT',
    nodes: [
      { icon: Armchair, name: 'Robot Arm', tooltip: 'Control a robot arm' },
      { icon: Thermometer, name: 'Sensor', tooltip: 'Read sensor data' },
      { icon: Lightbulb, name: 'Smart Light', tooltip: 'Control lighting' },
    ],
  },
  {
    label: 'Outputs',
    nodes: [
      { icon: Mail, name: 'Send Email', tooltip: 'Send an email' },
      { icon: FileText, name: 'Log', tooltip: 'Log data to a file' },
    ],
  },
];

export default function NodeLibrarySidebar() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-headline font-semibold">Node Library</h2>
          <Badge variant="outline">18</Badge>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        {nodeCategories.map((category) => (
          <SidebarGroup key={category.label}>
            <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
            <SidebarMenu>
              {category.nodes.map((node) => (
                <SidebarMenuItem key={node.name}>
                  <SidebarMenuButton
                    className="group-data-[collapsible=icon]:justify-center"
                    tooltip={{
                      children: node.tooltip,
                      className: 'font-body',
                    }}
                  >
                    <node.icon />
                    <span>{node.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Separator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Settings' }}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Help & Documentation' }}>
              <HelpCircle />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
