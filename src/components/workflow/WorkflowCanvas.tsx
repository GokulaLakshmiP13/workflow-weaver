import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useWorkflow } from '@/hooks/use-workflow';
import { SVGNode } from './SVGNode';
import { SVGEdge, SVGTempEdge } from './SVGEdge';
import { NodeConfigModal } from './NodeConfigModal';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/workflow-constants';
import { NodeType, WorkflowNode } from '@/lib/workflow-manager';
import { Code2, Copy, X } from 'lucide-react';

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

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('workflow/node-type') as NodeType;
    if (!type) return;
    const pt = getSVGPoint(e.clientX, e.clientY);
    const node = addNode(type, pt.x - NODE_WIDTH / 2, pt.y - NODE_HEIGHT / 2);
    setConfigNode(node);
  }, [getSVGPoint, addNode]);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    const pt = getSVGPoint(e.clientX, e.clientY);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNode(nodeId);
    setDragState({ type: 'node', nodeId, offsetX: pt.x - node.x, offsetY: pt.y - node.y });
  }, [getSVGPoint, nodes]);

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
      addEdge(connectState.sourceId, nodeId);
      setConnectState(null);
    }
  }, [connectState, addEdge]);

  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).classList.contains('canvas-bg')) {
      setSelectedNode(null);
      setPanState({ startX: e.clientX, startY: e.clientY, originX: viewBox.x, originY: viewBox.y });
    }
  }, [viewBox]);

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

  const gridSize = 20;

  return (
    <div className="flex-1 relative overflow-hidden bg-[hsl(var(--canvas-bg))]">
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button
          onClick={() => setShowJSON(!showJSON)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md bg-card text-muted-foreground border border-border workflow-shadow hover:text-foreground transition-colors"
        >
          <Code2 size={13} />
          {showJSON ? 'Hide' : 'JSON'}
        </button>
        <button
        onClick={() => {
            const json = JSON.stringify(toJSON(), null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workflow.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md bg-primary text-primary-foreground workflow-shadow hover:opacity-90 transition-opacity"
        >
          <Copy size={13} />
          Export
        </button>
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Code2 size={20} className="text-muted-foreground/60" />
            </div>
            <p className="text-muted-foreground text-[13px] font-medium">Drop components here to start</p>
            <p className="text-muted-foreground/40 text-[11px] mt-1">Connect outputs to inputs to define flow</p>
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
        <defs>
          <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <circle cx={gridSize / 2} cy={gridSize / 2} r={0.8} fill="#c4c8d0" opacity={0.4} />
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

        {connectState && (
          <SVGTempEdge
            startX={connectState.startX}
            startY={connectState.startY}
            endX={connectState.endX}
            endY={connectState.endY}
          />
        )}

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

      {configNode && (
        <NodeConfigModal
          node={configNode}
          onClose={() => setConfigNode(null)}
          onSave={(cfg) => updateNodeConfig(configNode.id, cfg)}
        />
      )}

      {showJSON && (
        <div className="absolute bottom-3 right-3 z-10 w-[400px] max-h-[55vh] bg-card border border-border rounded-lg workflow-shadow-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Output</span>
            <button onClick={() => setShowJSON(false)} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          </div>
          <pre className="p-4 text-[11px] leading-relaxed overflow-auto max-h-[48vh] text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            {JSON.stringify(toJSON(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
