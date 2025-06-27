
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

export type AlgorithmType = "dijkstra" | "prim" | "kruskal" | "floyd-warshall" | "none" | null;

export interface AnimationStep {
  type: "highlight-node" | "highlight-edge" | "update-node-label" | "message" | "reset-colors" | "clear-labels" | "update-matrix";
  nodeId?: string;
  edgeId?: string;
  label?: string;
  color?: string;
  message?: string;
  payload?: { matrix: (number | string)[][]; nodeLabels: string[] }; // For update-matrix
  nodesToHighlight?: string[];
  edgesToHighlight?: string[];
  descriptionForAI?: string; // State description for AI help
}

// For predefined application graphs
export interface ApplicationGraphData {
  nodes: Node[];
  edges: Edge[];
  startNode?: string; // Optional, for algorithms like Dijkstra
  description: string; // A brief description of the scenario
  algorithm: AlgorithmType;
  nextNodeId?: number; // To continue numbering if user edits
  nextEdgeId?: number; // To continue numbering if user edits
}
