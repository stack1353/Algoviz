
import type { Graph, AnimationStep } from '@/types/graph';

export function floydWarshall(graph: Graph): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const { nodes, edges } = graph;
  const nodeIds = nodes.map(n => n.id);
  const nodeLabels = nodes.map(n => n.label || n.id.replace('node-','N'));
  const n = nodes.length;

  if (n === 0) {
    steps.push({ type: "message", message: "Graph is empty.", descriptionForAI: "Error: Graph is empty for Floyd-Warshall algorithm." });
    return steps;
  }
  
  steps.push({ type: "message", message: "Starting Floyd-Warshall Algorithm", descriptionForAI: "Floyd-Warshall algorithm initialized to find all-pairs shortest paths." });

  // Create an index map for node IDs
  const nodeIndexMap = new Map<string, number>();
  nodes.forEach((node, index) => {
    nodeIndexMap.set(node.id, index);
  });

  // Initialize distance matrix
  let dist: (number | string)[][] = Array(n).fill(0).map(() => Array(n).fill('∞'));

  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }

  edges.forEach(edge => {
    const u = nodeIndexMap.get(edge.source)!;
    const v = nodeIndexMap.get(edge.target)!;
    dist[u][v] = edge.weight;
    if (!edge.isDirected) {
      dist[v][u] = edge.weight;
    }
  });

  steps.push({
    type: "update-matrix",
    payload: { matrix: dist, nodeLabels },
    descriptionForAI: "Distance matrix initialized with direct edge weights and 0s on the diagonal."
  });
  steps.push({ type: "message", message: "Initialized distance matrix from graph edges." });

  // Main algorithm
  for (let k = 0; k < n; k++) {
    const kId = nodeIds[k];
    steps.push({ type: "message", message: `Using node ${nodeLabels[k]} as intermediate vertex.` });
    steps.push({ type: "highlight-node", nodeId: kId, color: "hsl(var(--accent))", descriptionForAI: `Considering paths via intermediate node ${nodeLabels[k]}.` });
    
    let hasChanged = false;

    for (let i = 0; i < n; i++) {
      const iId = nodeIds[i];
      for (let j = 0; j < n; j++) {
        const jId = nodeIds[j];
        
        steps.push({ 
            type: "highlight-node", 
            nodeId: iId, 
            color: "hsl(var(--secondary))", 
            descriptionForAI: `Checking path from ${nodeLabels[i]} to ${nodeLabels[j]}.`
        });
        steps.push({ type: "highlight-node", nodeId: jId, color: "hsl(var(--secondary))" });


        const distIK = dist[i][k];
        const distKJ = dist[k][j];
        const distIJ = dist[i][j];
        
        if (distIK !== '∞' && distKJ !== '∞') {
            const newDist = (distIK as number) + (distKJ as number);
            if (distIJ === '∞' || newDist < (distIJ as number)) {
              dist[i][j] = newDist;
              hasChanged = true;
              steps.push({ type: "message", message: `Path ${nodeLabels[i]}->${nodeLabels[k]}->${nodeLabels[j]} is shorter. dist[${nodeLabels[i]}][${nodeLabels[j]}] = ${newDist}` });
              steps.push({
                type: "highlight-node", 
                nodeId: iId, 
                color: "hsl(var(--primary))", 
                descriptionForAI: `Path from ${nodeLabels[i]} to ${nodeLabels[j]} through ${nodeLabels[k]} is shorter. New distance: ${newDist}.`
              });
              steps.push({ type: "highlight-node", nodeId: jId, color: "hsl(var(--primary))" });
            }
        }
      }
    }
    
    if (hasChanged) {
        let newDistMatrix = dist.map(row => [...row]); // Deep copy
        steps.push({
            type: "update-matrix",
            payload: { matrix: newDistMatrix, nodeLabels },
            descriptionForAI: `Distance matrix updated after considering paths through ${nodeLabels[k]}.`
        });
    }

    // Reset highlights for next k iteration
    steps.push({ type: "reset-colors" });
    steps.push({ type: "highlight-node", nodeId: kId, color: "hsl(var(--accent))" }); // Keep k highlighted
  }

  steps.push({ type: "reset-colors" });

  // Check for negative cycles
  for (let i = 0; i < n; i++) {
    if ((dist[i][i] as number) < 0) {
      steps.push({ type: "message", message: `Negative weight cycle detected involving node ${nodeLabels[i]}.`, descriptionForAI: `Algorithm detected a negative weight cycle.` });
      steps.push({ type: "highlight-node", nodeId: nodeIds[i], color: "hsl(var(--destructive))"});
    }
  }

  steps.push({ type: "message", message: "Floyd-Warshall Algorithm complete. Final distance matrix shown.", descriptionForAI: "Floyd-Warshall algorithm finished. Final matrix of shortest paths is displayed." });

  return steps;
}
