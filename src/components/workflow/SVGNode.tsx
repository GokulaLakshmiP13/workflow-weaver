import React from 'react';
import { createPortal } from 'react-dom';
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

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function SVGNode({ node, isSelected, onMouseDown, onConnectorMouseDown, onConnectorMouseUp, onDoubleClick }: Props) {
  const cfg = NODE_TYPE_CONFIG[node.type];
  const w = NODE_WIDTH;
  const h = NODE_HEIGHT;
  const r = 10;
  const rgb = hexToRgb(cfg.color);
  const bgTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`;
  const iconBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      style={{ cursor: 'grab' }}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, node.id); }}
      onDoubleClick={() => onDoubleClick(node.id)}
    >
      {/* Drop shadow */}
      <filter id={`shadow-${node.id}`} x="-10%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.08)" />
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.04)" />
      </filter>

      {/* Card body */}
      <rect
        width={w} height={h} rx={r}
        fill="white"
        stroke={isSelected ? cfg.color : '#e2e5ea'}
        strokeWidth={isSelected ? 2 : 1}
        filter={`url(#shadow-${node.id})`}
      />

      {/* Subtle tint fill */}
      <rect width={w} height={h} rx={r} fill={bgTint} />

      {/* Left color bar */}
      <rect x={0} y={12} width={3.5} height={h - 24} rx={1.75} fill={cfg.color} />

      {/* Icon background */}
      <rect x={14} y={(h - 32) / 2} width={32} height={32} rx={8} fill={iconBg} />

      {/* Icon placeholder — rendered as foreignObject for Lucide */}
      <foreignObject x={14} y={(h - 32) / 2} width={32} height={32}>
        <div
          style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: cfg.color,
          }}
        >
          <cfg.icon size={16} strokeWidth={2.2} />
        </div>
      </foreignObject>

      {/* Label */}
      <text x={56} y={h / 2 - 7} textAnchor="start" dominantBaseline="middle"
        fontSize={13} fontWeight={600} fill="#1a1d23"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {node.label}
      </text>

      {/* Type badge */}
      <text x={56} y={h / 2 + 11} textAnchor="start" dominantBaseline="middle"
        fontSize={10} fontWeight={500} fill="#8b8f99"
        style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em' }}>
        {cfg.description}
      </text>

      {/* Input connector (top) — large invisible hit area + visible circle */}
      <circle
        cx={w / 2} cy={0} r={20}
        fill="transparent" stroke="none"
        style={{ cursor: 'crosshair' }}
        onMouseUp={(e) => { e.stopPropagation(); onConnectorMouseUp(e, node.id, 'input'); }}
      />
      <circle
        cx={w / 2} cy={0} r={CONNECTOR_RADIUS}
        fill="white" stroke="#c8ccd4" strokeWidth={1.5}
        style={{ cursor: 'crosshair', pointerEvents: 'none' }}
      />
      <circle cx={w / 2} cy={0} r={2.5} fill="#c8ccd4" style={{ pointerEvents: 'none' }} />

      {/* Output connector (bottom) */}
      <circle
        cx={w / 2} cy={h} r={CONNECTOR_RADIUS}
        fill={cfg.color} stroke="white" strokeWidth={2}
        style={{ cursor: 'crosshair' }}
        onMouseDown={(e) => { e.stopPropagation(); onConnectorMouseDown(e, node.id, 'output'); }}
      />
    </g>
  );
}
