import { NodeType } from '@/lib/workflow-manager';

export const NODE_TYPE_CONFIG: Record<NodeType, {
  color: string;
  bgClass: string;
  borderClass: string;
  icon: string;
  description: string;
}> = {
  audience: {
    color: 'hsl(220, 75%, 56%)',
    bgClass: 'bg-[hsl(220,75%,56%)]',
    borderClass: 'border-[hsl(220,75%,56%)]',
    icon: '👥',
    description: 'Define target audience segment',
  },
  filter: {
    color: 'hsl(32, 95%, 55%)',
    bgClass: 'bg-[hsl(32,95%,55%)]',
    borderClass: 'border-[hsl(32,95%,55%)]',
    icon: '🔍',
    description: 'Filter by conditions',
  },
  split: {
    color: 'hsl(280, 65%, 55%)',
    bgClass: 'bg-[hsl(280,65%,55%)]',
    borderClass: 'border-[hsl(280,65%,55%)]',
    icon: '🔀',
    description: 'A/B split traffic',
  },
  action: {
    color: 'hsl(150, 60%, 42%)',
    bgClass: 'bg-[hsl(150,60%,42%)]',
    borderClass: 'border-[hsl(150,60%,42%)]',
    icon: '⚡',
    description: 'Execute action (email, SMS, etc.)',
  },
  wait: {
    color: 'hsl(45, 93%, 52%)',
    bgClass: 'bg-[hsl(45,93%,52%)]',
    borderClass: 'border-[hsl(45,93%,52%)]',
    icon: '⏳',
    description: 'Wait for duration or event',
  },
  end: {
    color: 'hsl(0, 0%, 45%)',
    bgClass: 'bg-[hsl(0,0%,45%)]',
    borderClass: 'border-[hsl(0,0%,45%)]',
    icon: '🏁',
    description: 'End workflow',
  },
};

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 72;
export const CONNECTOR_RADIUS = 8;
