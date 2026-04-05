import React from 'react';
import { WorkflowNode } from '@/lib/workflow-manager';
import { NODE_TYPE_CONFIG, NODE_WIDTH, NODE_HEIGHT, CONNECTOR_RADIUS } from '@/lib/workflow-constants';

interface Props {
  node: WorkflowNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onConnectorMouseDown: (e: React.MouseEvent, nodeId: string, type: 'output') => void;
  onConnectorMouseUp: (e: React.MouseEvent, nodeId: string, type: 'input') => void;
  onDoubleClick: (nodeId: string) => void;
}

export function SVGNode({ node, isSelected, onMouseDown, onConnectorMouseDown, onConnectorMouseUp, onDoubleClick }: Props) {
  const cfg = NODE_TYPE_CONFIG[node.type];
  const w = NODE_WIDTH;
  const h = NODE_HEIGHT;
  const r = 12;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      style={{ cursor: 'grab' }}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, node.id); }}
      onDoubleClick={() => onDoubleClick(node.id)}
    >
      {/* Shadow */}
      <rect x={2} y={3} width={w} height={h} rx={r} fill="black" opacity={0.06} />

      {/* Body */}
      <rect
        width={w} height={h} rx={r}
        fill="white"
        stroke={isSelected ? cfg.color : 'hsl(220, 15%, 88%)'}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />

      {/* Color accent bar */}
      <rect x={0} y={0} width={5} height={h} rx={2.5} fill={cfg.color} />

      {/* Icon */}
      <text x={20} y={h / 2 + 1} textAnchor="start" dominantBaseline="middle" fontSize={18}>
        {cfg.icon}
      </text>

      {/* Label */}
      <text x={44} y={h / 2 - 6} textAnchor="start" dominantBaseline="middle"
        fontSize={13} fontWeight={600} fill="hsl(220, 25%, 15%)"
        style={{ fontFamily: 'var(--font-display)' }}>
        {node.label}
      </text>

      {/* Type subtitle */}
      <text x={44} y={h / 2 + 12} textAnchor="start" dominantBaseline="middle"
        fontSize={10} fill="hsl(220, 10%, 55%)"
        style={{ fontFamily: 'var(--font-display)' }}>
        {node.type.toUpperCase()}
      </text>

      {/* Input connector (top center) */}
      <circle
        cx={w / 2} cy={0} r={CONNECTOR_RADIUS}
        fill="white" stroke={cfg.color} strokeWidth={2}
        style={{ cursor: 'crosshair' }}
        onMouseUp={(e) => { e.stopPropagation(); onConnectorMouseUp(e, node.id, 'input'); }}
      />

      {/* Output connector (bottom center) */}
      <circle
        cx={w / 2} cy={h} r={CONNECTOR_RADIUS}
        fill={cfg.color} stroke="white" strokeWidth={2}
        style={{ cursor: 'crosshair' }}
        onMouseDown={(e) => { e.stopPropagation(); onConnectorMouseDown(e, node.id, 'output'); }}
      />
    </g>
  );
}
