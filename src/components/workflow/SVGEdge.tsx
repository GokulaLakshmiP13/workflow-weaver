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
  const cp = Math.max(40, dy * 0.45);

  const d = `M ${sx} ${sy} C ${sx} ${sy + cp}, ${tx} ${ty - cp}, ${tx} ${ty}`;

  return (
    <g onDoubleClick={() => onDoubleClick(edge.id)}>
      <path d={d} fill="none" stroke="transparent" strokeWidth={14} style={{ cursor: 'pointer' }} />
      <path
        d={d}
        fill="none"
        stroke="#b4b9c4"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Arrowhead dot at target */}
      <circle cx={tx} cy={ty} r={2.5} fill="#b4b9c4" />
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
  const cp = Math.max(40, dy * 0.45);
  const d = `M ${startX} ${startY} C ${startX} ${startY + cp}, ${endX} ${endY - cp}, ${endX} ${endY}`;

  return (
    <path d={d} fill="none" stroke="#3b5fe0" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.6} strokeLinecap="round" />
  );
}
