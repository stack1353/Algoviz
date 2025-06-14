
import type { Graph, Node, Edge, AnimationStep } from '@/types/graph';

export function kruskal(graph: Graph): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const { nodes, edges } = graph;

  if (nodes.length === 0) {
    steps.push({ type: "message", message: "Graph is empty.", descriptionForAI: "Error: Graph is empty for Kruskal's algorithm." });
    return steps;
  }
  
  steps.push({ type: "message", message: "Starting Kruskal's Algorithm", descriptionForAI: "Kruskal's algorithm initialized to find Minimum Spanning Tree." });

  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  steps.push({ type: "message", message: "Edges sorted by weight.", descriptionForAI: "All graph edges have been sorted by their weights." });

  const mstEdges: Edge[] = [];
  // Placeholder: Simulate DSU (Disjoint Set Union)
  const parent: { [nodeId: string]: string } = {};
  nodes.forEach(node => parent[node.id] = node.id);

  function find(nodeId: string): string {
    if (parent[nodeId] === nodeId) return nodeId;
    return find(parent[nodeId]);
  }

  function union(nodeId1: string, nodeId2: string) {
    const root1 = find(nodeId1);
    const root2 = find(nodeId2);
    if (root1 !== root2) {
      parent[root1] = root2;
      return true;
    }
    return false;
  }

  for (const edge of sortedEdges) {
     steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--primary))", descriptionForAI: `Considering edge ${edge.source}-${edge.target} (weight ${edge.weight}).` });
     if (find(edge.source) !== find(edge.target)) {
       union(edge.source, edge.target);
       mstEdges.push(edge);
       steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${edge.source}-${edge.target} added to MST (simulation).` });
       steps.push({ type: "highlight-node", nodeId: edge.source, color: "hsl(var(--secondary))", descriptionForAI: `Node ${edge.source} connected to MST.` });
       steps.push({ type: "highlight-node", nodeId: edge.target, color: "hsl(var(--secondary))", descriptionForAI: `Node ${edge.target} connected to MST.` });
       if (mstEdges.length === nodes.length - 1 && nodes.length > 0) break; 
     } else {
        steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--muted))", descriptionForAI: `Edge ${edge.source}-${edge.target} forms a cycle, skipped.` });
     }
  }
  
  // Final highlighting of MST
  if (mstEdges.length > 0 || (nodes.length === 1 && edges.length === 0)) {
    steps.push({ type: "message", message: "Kruskal's Algorithm complete. Minimum Spanning Tree (or forest) is highlighted.", descriptionForAI: "Kruskal's algorithm finished. Final MST/forest highlighted in accent color." });
    mstEdges.forEach(edge => {
      steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--accent))", descriptionForAI: `Edge ${edge.source}-${edge.target} is part of the final MST.` });
      steps.push({ type: "highlight-node", nodeId: edge.source, color: "hsl(var(--accent))", descriptionForAI: `Node ${edge.source} is part of the final MST.` });
      steps.push({ type: "highlight-node", nodeId: edge.target, color: "hsl(var(--accent))", descriptionForAI: `Node ${edge.target} is part of the final MST.` });
    });
     // Highlight isolated nodes if graph is a forest and not a single tree
    if (mstEdges.length < nodes.length - 1 && nodes.length > 0) {
        nodes.forEach(node => {
            const isConnected = mstEdges.some(edge => edge.source === node.id || edge.target === node.id);
            if (!isConnected) {
                 steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--accent))", descriptionForAI: `Node ${node.id} is part of the MST/forest (may be isolated or part of another component).` });
            }
        });
    } else if (nodes.length ===1 && mstEdges.length === 0){
        steps.push({ type: "highlight-node", nodeId: nodes[0].id, color: "hsl(var(--accent))", descriptionForAI: `Node ${nodes[0].id} forms a trivial MST.` });
    }


  } else if (nodes.length > 0) {
     steps.push({ type: "message", message: "Kruskal's Algorithm complete. No edges in MST (e.g., graph has no edges or is disconnected with no edges chosen).", descriptionForAI: "Kruskal's algorithm finished. No MST edges formed." });
  }


  return steps;
}
