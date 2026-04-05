import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useWorkflow } from '@/hooks/use-workflow';
import { SVGNode } from './SVGNode';
import { SVGEdge, SVGTempEdge } from './SVGEdge';
import { NodeConfigModal } from './NodeConfigModal';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/workflow-constants';
import { NodeType, WorkflowNode } from '@/lib/workflow-manager';

interface DragState {
  type: 'node';
  nodeId: string;
  offsetX: number;
  offsetY: number;
}

interface ConnectState {
  sourceId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface PanState {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

export function WorkflowCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, edges, addNode, removeNode, updateNodePosition, updateNodeConfig, addEdge, removeEdge, toJSON } = useWorkflow();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [connectState, setConnectState] = useState<ConnectState | null>(null);
  const [panState, setPanState] = useState<PanState | null>(null);
  const [viewBox, setViewBox] = useState({ x: -100, y: -50, w: 1200, h: 800 });
  const [configNode, setConfigNode] = useState<WorkflowNode | null>(null);
  const [showJSON, setShowJSON] = useState(false);

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = viewBox.x + (clientX - rect.left) / rect.width * viewBox.w;
    const y = viewBox.y + (clientY - rect.top) / rect.height * viewBox.h;
    return { x, y };
  }, [viewBox]);

  // Drop handler
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('workflow/node-type') as NodeType;
    if (!type) return;
    const pt = getSVGPoint(e.clientX, e.clientY);
    const node = addNode(type, pt.x - NODE_WIDTH / 2, pt.y - NODE_HEIGHT / 2);
    // Open config modal
    setConfigNode(node);
  }, [getSVGPoint, addNode]);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  // Node drag
  const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    const pt = getSVGPoint(e.clientX, e.clientY);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNode(nodeId);
    setDragState({ type: 'node', nodeId, offsetX: pt.x - node.x, offsetY: pt.y - node.y });
  }, [getSVGPoint, nodes]);

  // Connector drag (edge creation)
  const onConnectorMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const sx = node.x + NODE_WIDTH / 2;
    const sy = node.y + NODE_HEIGHT;
    const pt = getSVGPoint(e.clientX, e.clientY);
    setConnectState({ sourceId: nodeId, startX: sx, startY: sy, endX: pt.x, endY: pt.y });
  }, [nodes, getSVGPoint]);

  const onConnectorMouseUp = useCallback((_e: React.MouseEvent, nodeId: string) => {
    if (connectState) {
      const result = addEdge(connectState.sourceId, nodeId);
      if (!result) {
        // Could show error toast
      }
      setConnectState(null);
    }
  }, [connectState, addEdge]);

  // Canvas pan
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).classList.contains('canvas-bg')) {
      setSelectedNode(null);
      setPanState({ startX: e.clientX, startY: e.clientY, originX: viewBox.x, originY: viewBox.y });
    }
  }, [viewBox]);

  // Global mouse move/up
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragState) {
        const pt = getSVGPoint(e.clientX, e.clientY);
        updateNodePosition(dragState.nodeId, pt.x - dragState.offsetX, pt.y - dragState.offsetY);
      } else if (connectState) {
        const pt = getSVGPoint(e.clientX, e.clientY);
        setConnectState(prev => prev ? { ...prev, endX: pt.x, endY: pt.y } : null);
      } else if (panState) {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const dx = (e.clientX - panState.startX) / rect.width * viewBox.w;
        const dy = (e.clientY - panState.startY) / rect.height * viewBox.h;
        setViewBox(prev => ({ ...prev, x: panState.originX - dx, y: panState.originY - dy }));
      }
    };

    const onMouseUp = () => {
      setDragState(null);
      setConnectState(null);
      setPanState(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragState, connectState, panState, getSVGPoint, updateNodePosition, viewBox]);

  // Zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.08 : 0.92;
    const pt = getSVGPoint(e.clientX, e.clientY);
    setViewBox(prev => {
      const nw = prev.w * scale;
      const nh = prev.h * scale;
      const nx = pt.x - (pt.x - prev.x) * scale;
      const ny = pt.y - (pt.y - prev.y) * scale;
      return { x: nx, y: ny, w: nw, h: nh };
    });
  }, [getSVGPoint]);

  // Delete selected
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode && !configNode) {
        removeNode(selectedNode);
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNode, configNode, removeNode]);

  // Grid pattern
  const gridSize = 24;

  return (
    <div className="flex-1 relative overflow-hidden bg-[hsl(var(--canvas-bg))]">
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={() => setShowJSON(!showJSON)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-card text-foreground border border-border workflow-shadow hover:bg-accent transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {showJSON ? 'Close' : '{ } Export JSON'}
        </button>
        <button
          onClick={() => {
            const json = JSON.stringify(toJSON(), null, 2);
            navigator.clipboard.writeText(json);
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground workflow-shadow hover:opacity-90 transition-opacity"
        >
          💾 Save
        </button>
      </div>

      {/* Info */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Drag nodes from the sidebar to get started</p>
            <p className="text-muted-foreground/50 text-xs mt-1">Connect nodes by dragging from output ● to input ○</p>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseDown={onCanvasMouseDown}
        onWheel={onWheel}
        style={{ cursor: panState ? 'grabbing' : 'default' }}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <circle cx={gridSize / 2} cy={gridSize / 2} r={1} fill="hsl(220, 15%, 82%)" opacity={0.5} />
          </pattern>
        </defs>
        <rect
          className="canvas-bg"
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.w + 4000}
          height={viewBox.h + 4000}
          fill="url(#grid)"
        />

        {/* Edges */}
        {edges.map(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <SVGEdge
              key={edge.id}
              edge={edge}
              sourceNode={source}
              targetNode={target}
              onDoubleClick={removeEdge}
            />
          );
        })}

        {/* Temp edge while connecting */}
        {connectState && (
          <SVGTempEdge
            startX={connectState.startX}
            startY={connectState.startY}
            endX={connectState.endX}
            endY={connectState.endY}
          />
        )}

        {/* Nodes */}
        {nodes.map(node => (
          <SVGNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            onMouseDown={onNodeMouseDown}
            onConnectorMouseDown={onConnectorMouseDown}
            onConnectorMouseUp={onConnectorMouseUp}
            onDoubleClick={(id) => setConfigNode(nodes.find(n => n.id === id) || null)}
          />
        ))}
      </svg>

      {/* Config Modal */}
      {configNode && (
        <NodeConfigModal
          node={configNode}
          onClose={() => setConfigNode(null)}
          onSave={(cfg) => updateNodeConfig(configNode.id, cfg)}
        />
      )}

      {/* JSON Export Panel */}
      {showJSON && (
        <div className="absolute bottom-3 right-3 z-10 w-[420px] max-h-[60vh] bg-card border border-border rounded-xl workflow-shadow-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Workflow JSON</span>
            <button onClick={() => setShowJSON(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
          </div>
          <pre className="p-4 text-[11px] overflow-auto max-h-[50vh] text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            {JSON.stringify(toJSON(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
