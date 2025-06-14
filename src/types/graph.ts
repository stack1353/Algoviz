
export interface Node {
  id: string;
  x: number;
  y: number;
  label?: string; // For Dijkstra distances, etc.
  color?: string; // For highlighting
}

export interface Edge {
  id:string;
  source: string; // Node ID
  target: string; // Node ID
  weight: number;
  color?: string; // For highlighting
  isDirected: boolean; // User can define this now
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export type AlgorithmType = "dijkstra" | "prim" | "kruskal" | null;

export interface AnimationStep {
  type: "highlight-node" | "highlight-edge" | "update-node-label" | "message" | "reset-colors" | "clear-labels";
  nodeId?: string;
  edgeId?: string;
  label?: string;
  color?: string;
  message?: string;
  nodesToHighlight?: string[];
  edgesToHighlight?: string[];
  descriptionForAI?: string; // State description for AI help
}
