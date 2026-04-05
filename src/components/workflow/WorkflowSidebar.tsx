import React from 'react';
import { NodeType } from '@/lib/workflow-manager';
import { NODE_TYPE_CONFIG } from '@/lib/workflow-constants';

const nodeTypes: NodeType[] = ['audience', 'filter', 'split', 'action', 'wait', 'end'];

export function WorkflowSidebar() {
  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('workflow/node-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-56 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold tracking-wide uppercase opacity-60">Node Palette</h2>
      </div>
      <div className="p-3 flex flex-col gap-2 overflow-y-auto flex-1">
        {nodeTypes.map(type => {
          const cfg = NODE_TYPE_CONFIG[type];
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors hover:bg-sidebar-accent group"
            >
              <span
                className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: cfg.color + '22', color: cfg.color }}
              >
                {cfg.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium capitalize">{type}</div>
                <div className="text-[10px] opacity-50 truncate">{cfg.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-[10px] opacity-40 text-center">Drag nodes onto the canvas</p>
      </div>
    </aside>
  );
}
