import React from 'react';
import { WorkflowNode, WorkflowEdge } from '@/lib/workflow-manager';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/workflow-constants';

interface Props {
  edge: WorkflowEdge;
  sourceNode: WorkflowNode;
  targetNode: WorkflowNode;
  onDoubleClick: (edgeId: string) => void;
}

export function SVGEdge({ edge, sourceNode, targetNode, onDoubleClick }: Props) {
  const sx = sourceNode.x + NODE_WIDTH / 2;
  const sy = sourceNode.y + NODE_HEIGHT;
  const tx = targetNode.x + NODE_WIDTH / 2;
  const ty = targetNode.y;

  const dy = Math.abs(ty - sy);
  const cp = Math.max(50, dy * 0.5);

  const d = `M ${sx} ${sy} C ${sx} ${sy + cp}, ${tx} ${ty - cp}, ${tx} ${ty}`;

  return (
    <g onDoubleClick={() => onDoubleClick(edge.id)}>
      {/* Invisible wider path for easier clicking */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={16} style={{ cursor: 'pointer' }} />
      <path
        d={d}
        fill="none"
        stroke="hsl(220, 20%, 65%)"
        strokeWidth={2}
        strokeDasharray="none"
        markerEnd=""
      />
      {/* Arrow at target */}
      <circle cx={tx} cy={ty} r={3} fill="hsl(220, 20%, 65%)" />
    </g>
  );
}

interface TempEdgeProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function SVGTempEdge({ startX, startY, endX, endY }: TempEdgeProps) {
  const dy = Math.abs(endY - startY);
  const cp = Math.max(50, dy * 0.5);
  const d = `M ${startX} ${startY} C ${startX} ${startY + cp}, ${endX} ${endY - cp}, ${endX} ${endY}`;

  return (
    <path d={d} fill="none" stroke="hsl(220, 70%, 56%)" strokeWidth={2} strokeDasharray="6 4" opacity={0.7} />
  );
}
