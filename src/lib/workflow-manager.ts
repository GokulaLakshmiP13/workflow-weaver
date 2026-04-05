// Step 1: The DAG Logic — WorkflowManager with DFS cycle detection

export type NodeType = 'audience' | 'filter' | 'split' | 'action' | 'wait' | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export class WorkflowManager {
  private nodes: Map<string, WorkflowNode> = new Map();
  private edges: Map<string, WorkflowEdge> = new Map();
  private adjacency: Map<string, Set<string>> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor(graph?: WorkflowGraph) {
    if (graph) {
      graph.nodes.forEach(n => this.nodes.set(n.id, { ...n }));
      graph.edges.forEach(e => {
        this.edges.set(e.id, { ...e });
        if (!this.adjacency.has(e.source)) this.adjacency.set(e.source, new Set());
        this.adjacency.get(e.source)!.add(e.target);
      });
    }
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  addNode(type: NodeType, x: number, y: number, config: Record<string, unknown> = {}): WorkflowNode {
    const id = `node-${this.generateId()}`;
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const node: WorkflowNode = { id, type, label, x, y, config };
    this.nodes.set(id, node);
    this.adjacency.set(id, new Set());
    this.notify();
    return node;
  }

  removeNode(id: string) {
    this.nodes.delete(id);
    this.adjacency.delete(id);
    // Remove all edges involving this node
    const edgesToRemove: string[] = [];
    this.edges.forEach((e, eid) => {
      if (e.source === id || e.target === id) edgesToRemove.push(eid);
    });
    edgesToRemove.forEach(eid => this.edges.delete(eid));
    this.adjacency.forEach(targets => targets.delete(id));
    this.notify();
  }

  updateNodePosition(id: string, x: number, y: number) {
    const node = this.nodes.get(id);
    if (node) {
      node.x = x;
      node.y = y;
      this.notify();
    }
  }

  updateNodeConfig(id: string, config: Record<string, unknown>) {
    const node = this.nodes.get(id);
    if (node) {
      node.config = { ...node.config, ...config };
      this.notify();
    }
  }

  updateNodeLabel(id: string, label: string) {
    const node = this.nodes.get(id);
    if (node) {
      node.label = label;
      this.notify();
    }
  }

  // DFS-based cycle detection
  private wouldCreateCycle(source: string, target: string): boolean {
    // Check if adding source→target creates a cycle
    // A cycle exists if there's already a path from target to source
    const visited = new Set<string>();
    const stack = [target];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === source) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const neighbors = this.adjacency.get(current);
      if (neighbors) {
        neighbors.forEach(n => stack.push(n));
      }
    }
    return false;
  }

  addEdge(source: string, target: string): WorkflowEdge | null {
    if (source === target) return null;
    if (!this.nodes.has(source) || !this.nodes.has(target)) return null;

    // Check for duplicate
    const existing = Array.from(this.edges.values()).find(
      e => e.source === source && e.target === target
    );
    if (existing) return null;

    // Cycle detection
    if (this.wouldCreateCycle(source, target)) return null;

    const id = `edge-${this.generateId()}`;
    const edge: WorkflowEdge = { id, source, target };
    this.edges.set(id, edge);
    if (!this.adjacency.has(source)) this.adjacency.set(source, new Set());
    this.adjacency.get(source)!.add(target);
    this.notify();
    return edge;
  }

  removeEdge(id: string) {
    const edge = this.edges.get(id);
    if (edge) {
      this.adjacency.get(edge.source)?.delete(edge.target);
      this.edges.delete(id);
      this.notify();
    }
  }

  getNode(id: string): WorkflowNode | undefined {
    return this.nodes.get(id);
  }

  getNodes(): WorkflowNode[] {
    return Array.from(this.nodes.values());
  }

  getEdges(): WorkflowEdge[] {
    return Array.from(this.edges.values());
  }

  toJSON(): WorkflowGraph {
    return {
      nodes: this.getNodes(),
      edges: this.getEdges(),
    };
  }
}
