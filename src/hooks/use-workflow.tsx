import React, { createContext, useContext, useCallback, useRef, useSyncExternalStore } from 'react';
import { WorkflowManager, WorkflowNode, WorkflowEdge, NodeType } from '@/lib/workflow-manager';

interface WorkflowContextValue {
  manager: WorkflowManager;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  addNode: (type: NodeType, x: number, y: number, config?: Record<string, unknown>) => WorkflowNode;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void;
  addEdge: (source: string, target: string) => WorkflowEdge | null;
  removeEdge: (id: string) => void;
  toJSON: () => { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

const manager = new WorkflowManager();

// Stable snapshot cache to avoid infinite loops with useSyncExternalStore
let cachedNodes = manager.getNodes();
let cachedEdges = manager.getEdges();
let cachedSnapshot = { nodes: cachedNodes, edges: cachedEdges };

manager.subscribe(() => {
  cachedNodes = manager.getNodes();
  cachedEdges = manager.getEdges();
  cachedSnapshot = { nodes: cachedNodes, edges: cachedEdges };
});

function getSnapshot() {
  return cachedSnapshot;
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    useCallback((cb: () => void) => manager.subscribe(cb), []),
    getSnapshot
  );

  const value: WorkflowContextValue = {
    manager,
    nodes: snapshot.nodes,
    edges: snapshot.edges,
    addNode: (type, x, y, config) => manager.addNode(type, x, y, config),
    removeNode: (id) => manager.removeNode(id),
    updateNodePosition: (id, x, y) => manager.updateNodePosition(id, x, y),
    updateNodeConfig: (id, config) => manager.updateNodeConfig(id, config),
    addEdge: (source, target) => manager.addEdge(source, target),
    removeEdge: (id) => manager.removeEdge(id),
    toJSON: () => manager.toJSON(),
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
}
