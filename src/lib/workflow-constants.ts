import { NodeType } from '@/lib/workflow-manager';
import { Users, Filter, GitFork, Zap, Clock, CircleStop } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const NODE_TYPE_CONFIG: Record<NodeType, {
  color: string;
  icon: LucideIcon;
  label: string;
  description: string;
}> = {
  audience: {
    color: '#3b5fe0',
    icon: Users,
    label: 'Audience',
    description: 'Target segment',
  },
  filter: {
    color: '#e07b24',
    icon: Filter,
    label: 'Filter',
    description: 'Apply conditions',
  },
  split: {
    color: '#8b45d6',
    icon: GitFork,
    label: 'Split',
    description: 'A/B test traffic',
  },
  action: {
    color: '#1a9a6b',
    icon: Zap,
    label: 'Action',
    description: 'Send email / SMS',
  },
  wait: {
    color: '#d4a017',
    icon: Clock,
    label: 'Wait',
    description: 'Delay execution',
  },
  end: {
    color: '#6b7280',
    icon: CircleStop,
    label: 'End',
    description: 'Terminate flow',
  },
};

export const NODE_WIDTH = 192;
export const NODE_HEIGHT = 68;
export const CONNECTOR_RADIUS = 7;
