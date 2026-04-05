import React from 'react';
import { NodeType } from '@/lib/workflow-manager';
import { NODE_TYPE_CONFIG } from '@/lib/workflow-constants';
import { Workflow } from 'lucide-react';

const nodeTypes: NodeType[] = ['audience', 'filter', 'split', 'action', 'wait', 'end'];

export function WorkflowSidebar() {
  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('workflow/node-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-[232px] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 select-none">
      {/* Brand header */}
      <div className="px-5 py-4 border-b border-sidebar-border flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-sidebar-primary flex items-center justify-center">
          <Workflow className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-sidebar-accent-foreground tracking-tight">Workflow Studio</div>
          <div className="text-[10px] text-sidebar-foreground/50 font-medium">Marketing Automation</div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Components</span>
      </div>

      {/* Node palette */}
      <div className="px-3 flex flex-col gap-0.5 overflow-y-auto flex-1">
        {nodeTypes.map(type => {
          const cfg = NODE_TYPE_CONFIG[type];
          const Icon = cfg.icon;
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-grab active:cursor-grabbing transition-all duration-150 hover:bg-sidebar-accent group"
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
                style={{ backgroundColor: cfg.color + '1a', color: cfg.color }}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-sidebar-accent-foreground">{cfg.label}</div>
                <div className="text-[10px] text-sidebar-foreground/40 leading-tight">{cfg.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-sidebar-border">
        <div className="text-[10px] text-sidebar-foreground/30 leading-relaxed">
          Drag components onto the canvas to build your workflow.
        </div>
      </div>
    </aside>
  );
}
