
import type { ApplicationGraphData, Node, Edge } from '@/types/graph';

// Helper to ensure consistent node/edge IDs if we generate them
let globalNodeId = 1;
let globalEdgeId = 1;
const gnId = () => `node-${globalNodeId++}`;
const geId = () => `edge-${globalEdgeId++}`;

const resetIds = () => {
    globalNodeId = 1;
    globalEdgeId = 1;
};

// Dijkstra Applications
const gpsNavigationGraph: ApplicationGraphData = {
  description: "GPS: Find the shortest route from City Hall to the Museum.",
  algorithm: "dijkstra",
  nodes: [
    { id: gnId(), label: "City Hall", x: 100, y: 200 },
    { id: gnId(), label: "Market", x: 250, y: 100 },
    { id: gnId(), label: "Park", x: 280, y: 300 },
    { id: gnId(), label: "Library", x: 450, y: 150 },
    { id: gnId(), label: "Museum", x: 480, y: 350 },
  ],
  edges: [
    { id: geId(), source: "node-1", target: "node-2", weight: 5, isDirected: false }, // City Hall - Market
    { id: geId(), source: "node-1", target: "node-3", weight: 3, isDirected: false }, // City Hall - Park
    { id: geId(), source: "node-2", target: "node-4", weight: 2, isDirected: false }, // Market - Library
    { id: geId(), source: "node-3", target: "node-2", weight: 1, isDirected: false }, // Park - Market
    { id: geId(), source: "node-3", target: "node-5", weight: 7, isDirected: false }, // Park - Museum
    { id: geId(), source: "node-4", target: "node-5", weight: 4, isDirected: false }, // Library - Museum
  ],
  startNode: "node-1", // City Hall
  nextNodeId: globalNodeId,
  nextEdgeId: globalEdgeId,
};
resetIds();

const networkRoutingGraph: ApplicationGraphData = {
  description: "Network: Find the fastest data path from Router A to Router F.",
  algorithm: "dijkstra",
  nodes: [
    { id: gnId(), label: "Router A", x: 50, y: 150 },
    { id: gnId(), label: "Router B", x: 200, y: 50 },
    { id: gnId(), label: "Router C", x: 220, y: 250 },
    { id: gnId(), label: "Router D", x: 350, y: 100 },
    { id: gnId(), label: "Router E", x: 380, y: 300 },
    { id: gnId(), label: "Router F", x: 500, y: 180 },
  ],
  edges: [
    { id: geId(), source: "node-1", target: "node-2", weight: 10, isDirected: true }, // A-B
    { id: geId(), source: "node-1", target: "node-3", weight: 15, isDirected: true }, // A-C
    { id: geId(), source: "node-2", target: "node-4", weight: 12, isDirected: true }, // B-D
    { id: geId(), source: "node-3", target: "node-5", weight: 10, isDirected: true }, // C-E
    { id: geId(), source: "node-4", target: "node-3", weight: 2, isDirected: true },  // D-C (cycle possibility)
    { id: geId(), source: "node-4", target: "node-6", weight: 1, isDirected: true },  // D-F
    { id: geId(), source: "node-5", target: "node-6", weight: 5, isDirected: true },  // E-F
  ],
  startNode: "node-1", // Router A
  nextNodeId: globalNodeId,
  nextEdgeId: globalEdgeId,
};
resetIds();

// Prim Applications
const powerGridGraph: ApplicationGraphData = {
  description: "Power Grid: Connect all substations with minimum cable length.",
  algorithm: "prim",
  nodes: [
    { id: gnId(), label: "Sub 1", x: 100, y: 100 },
    { id: gnId(), label: "Sub 2", x: 300, y: 150 },
    { id: gnId(), label: "Sub 3", x: 150, y: 300 },
    { id: gnId(), label: "Sub 4", x: 400, y: 250 },
    { id: gnId(), label: "Sub 5", x: 250, y: 400 },
  ],
  edges: [
    { id: geId(), source: "node-1", target: "node-2", weight: 5, isDirected: false },
    { id: geId(), source: "node-1", target: "node-3", weight: 3, isDirected: false },
    { id: geId(), source: "node-2", target: "node-3", weight: 4, isDirected: false },
    { id: geId(), source: "node-2", target: "node-4", weight: 6, isDirected: false },
    { id: geId(), source: "node-3", target: "node-4", weight: 7, isDirected: false },
    { id: geId(), source: "node-3", target: "node-5", weight: 5, isDirected: false },
    { id: geId(), source: "node-4", target: "node-5", weight: 2, isDirected: false },
  ],
  nextNodeId: globalNodeId,
  nextEdgeId: globalEdgeId,
};
resetIds();

const conceptualClusteringGraph: ApplicationGraphData = {
  description: "Clustering: Identify data groups using MST (remove longest edges).",
  algorithm: "prim", // or Kruskal, as it's for MST
  nodes: [
    { id: gnId(), label: "P1", x: 50, y: 50 }, { id: gnId(), label: "P2", x: 70, y: 80 }, { id: gnId(), label: "P3", x: 100, y: 60 }, // Cluster 1
    { id: gnId(), label: "P4", x: 200, y: 200 }, { id: gnId(), label: "P5", x: 230, y: 220 }, { id: gnId(), label: "P6", x: 210, y: 180 }, // Cluster 2
    { id: gnId(), label: "P7", x: 350, y: 350 }, { id: gnId(), label: "P8", x: 380, y: 320 }, // Cluster 3
  ],
  // Edges represent all-pairs distances, but for simplicity, we'll just add a few to make it connectable.
  // In a real scenario, all pairs would be considered or dynamically calculated.
  edges: [
    { id: geId(), source: "node-1", target: "node-2", weight: 3, isDirected: false },
    { id: geId(), source: "node-2", target: "node-3", weight: 2, isDirected: false },
    { id: geId(), source: "node-4", target: "node-5", weight: 3, isDirected: false },
    { id: geId(), source: "node-5", target: "node-6", weight: 2, isDirected: false },
    { id: geId(), source: "node-7", target: "node-8", weight: 4, isDirected: false },
    { id: geId(), source: "node-3", target: "node-6", weight: 15, isDirected: false }, // "Long" edge between clusters
    { id: geId(), source: "node-6", target: "node-7", weight: 18, isDirected: false }, // "Long" edge between clusters
  ],
  nextNodeId: globalNodeId,
  nextEdgeId: globalEdgeId,
};
resetIds();

// Kruskal Applications
const circuitBoardGraph: ApplicationGraphData = {
  description: "Circuit Board: Connect components with minimum wire.",
  algorithm: "kruskal",
  nodes: [
    { id: gnId(), label: "CPU", x: 150, y: 150 },
    { id: gnId(), label: "RAM", x: 300, y: 100 },
    { id: gnId(), label: "GPU", x: 180, y: 300 },
    { id: gnId(), label: "SSD", x: 350, y: 250 },
  ],
  edges: [
    { id: geId(), source: "node-1", target: "node-2", weight: 10, isDirected: false }, // CPU-RAM
    { id: geId(), source: "node-1", target: "node-3", weight: 12, isDirected: false }, // CPU-GPU
    { id: geId(), source: "node-1", target: "node-4", weight: 15, isDirected: false }, // CPU-SSD
    { id: geId(), source: "node-2", target: "node-3", weight: 8, isDirected: false },  // RAM-GPU
    { id: geId(), source: "node-2", target: "node-4", weight: 5, isDirected: false },  // RAM-SSD
    { id: geId(), source: "node-3", target: "node-4", weight: 9, isDirected: false },  // GPU-SSD
  ],
  nextNodeId: globalNodeId,
  nextEdgeId: globalEdgeId,
};
resetIds();

const connectingIslandsGraph: ApplicationGraphData = {
  description: "Islands: Connect all islands with minimum bridge cost.",
  algorithm: "kruskal",
  nodes: [
    { id: gnId(), label: "Isla A", x: 100, y: 100 },
    { id: gnId(), label: "Isla B", x: 300, y: 80 },
    { id: gnId(), label: "Isla C", x: 150, y: 250 },
    { id: gnId(), label: "Isla D", x: 400, y: 300 },
    { id: gnId(), label: "Isla E", x: 250, y: 400 },
  ],
  edges: [
    { id: geId(), source: "node-1", target: "node-2", weight: 20, isDirected: false },
    { id: geId(), source: "node-1", target: "node-3", weight: 10, isDirected: false },
    { id: geId(), source: "node-2", target: "node-3", weight: 15, isDirected: false },
    { id: geId(), source: "node-2", target: "node-4", weight: 30, isDirected: false },
    { id: geId(), source: "node-3", target: "node-4", weight: 25, isDirected: false },
    { id: geId(), source: "node-3", target: "node-5", weight: 5, isDirected: false },
    { id: geId(), source: "node-4", target: "node-5", weight: 18, isDirected: false },
  ],
  nextNodeId: globalNodeId,
  nextEdgeId: globalEdgeId,
};
resetIds();

export const applicationGraphs: Record<string, ApplicationGraphData> = {
  "gps-navigation": gpsNavigationGraph,
  "network-routing-ospf": networkRoutingGraph,
  "network-design-power-cable": powerGridGraph,
  "clustering-conceptual": conceptualClusteringGraph,
  "circuit-board-design": circuitBoardGraph,
  "connecting-islands-bridges": connectingIslandsGraph,
};
