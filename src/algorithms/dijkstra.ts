
import type { Graph, Node, Edge, AnimationStep } from '@/types/graph';

export function dijkstra(graph: Graph, startNodeId: string): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const { nodes, edges } = graph;

  const startNodeExists = nodes.find(n => n.id === startNodeId);
  if (!startNodeExists) {
    steps.push({ type: "message", message: "Start node not found.", descriptionForAI: "Error: Start node not found for Dijkstra's algorithm." });
    return steps;
  }
  
  steps.push({ type: "message", message: `Starting Dijkstra's Algorithm from node ${startNodeId}`, descriptionForAI: `Dijkstra's algorithm initialized starting from node ${startNodeId}.` });
  
  const distances: { [nodeId: string]: number } = {};
  const visited: { [nodeId: string]: boolean } = {};
  const predecessors: { [nodeId: string]: string | null } = {};
  
  nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
    steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--secondary))", descriptionForAI: `Node ${node.id} initialized with infinite distance.` });
    steps.push({ type: "update-node-label", nodeId: node.id, label: "∞" });
  });
  
  distances[startNodeId] = 0;
  steps.push({ type: "update-node-label", nodeId: startNodeId, label: "0" });
  steps.push({ type: "highlight-node", nodeId: startNodeId, color: "hsl(var(--primary))", descriptionForAI: `Node ${startNodeId} (start node) distance set to 0.` });

  const pq: string[] = [...nodes.map(n => n.id)]; // Simple array as priority queue

  while (pq.length > 0) {
    pq.sort((a, b) => distances[a] - distances[b]); // Sort to get min distance node
    const u = pq.shift();

    if (!u || distances[u] === Infinity) break; // No path or remaining nodes unreachable

    visited[u] = true;
    steps.push({ type: "highlight-node", nodeId: u, color: "hsl(var(--accent))", descriptionForAI: `Node ${u} is currently being processed. Distance: ${distances[u]}.` });

    const neighbors = edges.filter(edge => {
        if (edge.source === u && !visited[edge.target]) return true;
        if (!edge.isDirected && edge.target === u && !visited[edge.source]) return true; // For undirected edges
        return false;
    });

    for (const edge of neighbors) {
        const v = edge.source === u ? edge.target : edge.source;
        const weight = edge.weight;
        steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--secondary))", descriptionForAI: `Considering edge ${edge.source}-${edge.target} (weight ${weight}).` });

        if (distances[u] + weight < distances[v]) {
            distances[v] = distances[u] + weight;
            predecessors[v] = u;
            steps.push({ type: "update-node-label", nodeId: v, label: distances[v].toString() });
            steps.push({ type: "highlight-node", nodeId: v, color: "hsl(var(--primary))", descriptionForAI: `Distance to ${v} updated to ${distances[v]}. Predecessor: ${u}.` });
        }
    }
  }
  
  steps.push({ type: "message", message: "Dijkstra's Algorithm complete. Final distances shown.", descriptionForAI: "Dijkstra's algorithm finished. Nodes reachable from start are highlighted with their shortest distances. Path edges are in accent color." });
  
  // Highlight final paths
  const pathEdges = new Set<string>();
  nodes.forEach(node => {
    if (distances[node.id] !== Infinity) {
      if (node.id === startNodeId) {
        steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--accent))", descriptionForAI: `Start node ${node.id} remains highlighted. Final distance: ${distances[node.id]}.` });
      } else {
        steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--primary))", descriptionForAI: `Node ${node.id} is reachable. Final distance: ${distances[node.id]}.` });
        
        // Trace back path to highlight edges
        let curr = node.id;
        while(predecessors[curr]) {
            const pred = predecessors[curr]!;
            const edge = edges.find(e => 
                (e.source === pred && e.target === curr) || 
                (!e.isDirected && e.source === curr && e.target === pred)
            );
            if (edge && !pathEdges.has(edge.id)) {
                pathEdges.add(edge.id);
            }
            curr = pred;
        }
      }
    } else {
       steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--muted))", descriptionForAI: `Node ${node.id} is not reachable from the start node.` });
       steps.push({ type: "update-node-label", nodeId: node.id, label: "∞" });
    }
  });

  edges.forEach(edge => {
      if (pathEdges.has(edge.id)) {
           steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--accent))", descriptionForAI: `Edge ${edge.source}-${edge.target} is part of a shortest path.` });
      } else {
           steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--border))", descriptionForAI: `Edge ${edge.source}-${edge.target} is not actively part of shortest path tree.` });
      }
  });

  return steps;
}
