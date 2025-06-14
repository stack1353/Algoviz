
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
  
  nodes.forEach(node => {
    distances[node.id] = Infinity;
    steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--secondary))", descriptionForAI: `Node ${node.id} initialized with infinite distance.` });
    steps.push({ type: "update-node-label", nodeId: node.id, label: "∞" });
  });
  
  distances[startNodeId] = 0;
  steps.push({ type: "update-node-label", nodeId: startNodeId, label: "0" });
  steps.push({ type: "highlight-node", nodeId: startNodeId, color: "hsl(var(--primary))", descriptionForAI: `Node ${startNodeId} (start node) distance set to 0.` });

  // Placeholder: Simulate some processing - a real implementation would involve a priority queue
  // For this placeholder, we'll just "visit" a few nodes and "relax" some edges.
  
  // Simulate visiting the start node
  visited[startNodeId] = true;
  steps.push({ type: "highlight-node", nodeId: startNodeId, color: "hsl(var(--accent))", descriptionForAI: `Node ${startNodeId} is currently being processed.` });

  // Simulate relaxing edges from startNode
  edges.forEach(edge => {
    if (edge.source === startNodeId || edge.target === startNodeId) { // Assuming undirected or checking both for directed
      const neighbor = edge.source === startNodeId ? edge.target : edge.source;
      if (!visited[neighbor]) {
        const newDist = distances[startNodeId] + edge.weight;
        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${edge.source}-${edge.target} considered for relaxation.` });
          steps.push({ type: "update-node-label", nodeId: neighbor, label: newDist.toString() });
          steps.push({ type: "highlight-node", nodeId: neighbor, color: "hsl(var(--primary))", descriptionForAI: `Distance to ${neighbor} updated to ${newDist}.` });
        }
      }
    }
  });
  
  // Simulate visiting another node if available
  const unvisitedNodes = nodes.filter(n => !visited[n.id] && distances[n.id] < Infinity);
  if (unvisitedNodes.length > 0) {
    const nextNodeToVisit = unvisitedNodes.sort((a,b) => distances[a.id] - distances[b.id])[0];
    if (nextNodeToVisit) {
        visited[nextNodeToVisit.id] = true;
        steps.push({ type: "highlight-node", nodeId: nextNodeToVisit.id, color: "hsl(var(--accent))", descriptionForAI: `Node ${nextNodeToVisit.id} is currently being processed.` });
         edges.forEach(edge => {
            if (edge.source === nextNodeToVisit.id || edge.target === nextNodeToVisit.id) {
                const neighbor = edge.source === nextNodeToVisit.id ? edge.target : edge.source;
                 if (!visited[neighbor]) {
                    const newDist = distances[nextNodeToVisit.id] + edge.weight;
                    if (newDist < distances[neighbor]) {
                        distances[neighbor] = newDist;
                        steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${edge.source}-${edge.target} considered for relaxation.` });
                        steps.push({ type: "update-node-label", nodeId: neighbor, label: newDist.toString() });
                        steps.push({ type: "highlight-node", nodeId: neighbor, color: "hsl(var(--primary))", descriptionForAI: `Distance to ${neighbor} updated to ${newDist}.` });
                    }
                }
            }
        });
    }
  }

  // Final highlighting step
  steps.push({ type: "message", message: "Dijkstra's Algorithm (placeholder) complete. Final distances shown.", descriptionForAI: "Dijkstra's algorithm simulation finished. Nodes reachable from start are highlighted." });
  nodes.forEach(node => {
    if (distances[node.id] !== Infinity) {
      if (node.id === startNodeId) {
        steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--accent))", descriptionForAI: `Start node ${node.id} remains highlighted. Final distance: ${distances[node.id]}.` });
      } else {
        steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--primary))", descriptionForAI: `Node ${node.id} is reachable. Final distance: ${distances[node.id]}.` });
      }
    } else {
       steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--muted))", descriptionForAI: `Node ${node.id} is not reachable from the start node.` });
    }
  });
  // In a real Dijkstra, you'd highlight the edges forming the shortest path tree.
  // For this placeholder, we'll just leave edges as they were or reset them.
  edges.forEach(edge => {
      const sourceDist = distances[edge.source];
      const targetDist = distances[edge.target];
      // A simple heuristic: if an edge connects two "reached" nodes and one is a predecessor of other in SP.
      // This is a very rough approximation for placeholder.
      if (sourceDist !== Infinity && targetDist !== Infinity && Math.abs(sourceDist - targetDist) === edge.weight ) {
           steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--accent))", descriptionForAI: `Edge ${edge.source}-${edge.target} is part of a shortest path.` });
      } else {
           steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--border))", descriptionForAI: `Edge ${edge.source}-${edge.target} is not actively part of shortest path tree.` });
      }
  });


  return steps;
}
