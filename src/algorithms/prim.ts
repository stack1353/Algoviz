
import type { Graph, Node, Edge, AnimationStep } from '@/types/graph';

export function prim(graph: Graph): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const { nodes, edges } = graph;

  if (nodes.length === 0) {
    steps.push({ type: "message", message: "Graph is empty.", descriptionForAI: "Error: Graph is empty for Prim's algorithm." });
    return steps;
  }

  steps.push({ type: "message", message: "Starting Prim's Algorithm", descriptionForAI: "Prim's algorithm initialized to find Minimum Spanning Tree." });

  const mstNodes = new Set<string>();
  const mstEdges: Edge[] = [];
  const edgeCandidates: Edge[] = []; // To store candidate edges like a priority queue

  const startNode = nodes[0];
  mstNodes.add(startNode.id);
  steps.push({ type: "highlight-node", nodeId: startNode.id, color: "hsl(var(--primary))", descriptionForAI: `Node ${startNode.id} selected as starting point for MST.` });

  // Add initial edges from start node
  edges.forEach(edge => {
    if (edge.source === startNode.id || edge.target === startNode.id) {
      edgeCandidates.push(edge);
       steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${edge.source}-${edge.target} (weight ${edge.weight}) added to candidates.` });
    }
  });

  while (mstNodes.size < nodes.length && edgeCandidates.length > 0) {
    edgeCandidates.sort((a, b) => a.weight - b.weight); // Simulate priority queue
    
    const minEdge = edgeCandidates.shift(); // Get edge with minimum weight
    if (!minEdge) break;

    steps.push({ type: "highlight-edge", edgeId: minEdge.id, color: "hsl(var(--primary))", descriptionForAI: `Considering edge ${minEdge.source}-${minEdge.target} (weight ${minEdge.weight}) from candidates.` });

    const node1InMst = mstNodes.has(minEdge.source);
    const node2InMst = mstNodes.has(minEdge.target);

    if (node1InMst && !node2InMst) {
      mstNodes.add(minEdge.target);
      mstEdges.push(minEdge);
      steps.push({ type: "highlight-node", nodeId: minEdge.target, color: "hsl(var(--primary))", descriptionForAI: `Node ${minEdge.target} added to MST.` });
      steps.push({ type: "highlight-edge", edgeId: minEdge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${minEdge.source}-${minEdge.target} added to MST.` });
      
      // Add new candidate edges from the newly added node
      edges.forEach(edge => {
        if ((edge.source === minEdge.target && !mstNodes.has(edge.target)) || (edge.target === minEdge.target && !mstNodes.has(edge.source))) {
          if (!edgeCandidates.find(e => e.id === edge.id)) { // Avoid duplicates
            edgeCandidates.push(edge);
             steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${edge.source}-${edge.target} added to candidates.` });
          }
        }
      });
    } else if (!node1InMst && node2InMst) {
      mstNodes.add(minEdge.source);
      mstEdges.push(minEdge);
      steps.push({ type: "highlight-node", nodeId: minEdge.source, color: "hsl(var(--primary))", descriptionForAI: `Node ${minEdge.source} added to MST.` });
      steps.push({ type: "highlight-edge", edgeId: minEdge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${minEdge.source}-${minEdge.target} added to MST.` });

      edges.forEach(edge => {
         if ((edge.source === minEdge.source && !mstNodes.has(edge.target)) || (edge.target === minEdge.source && !mstNodes.has(edge.source))) {
            if (!edgeCandidates.find(e => e.id === edge.id)) {
              edgeCandidates.push(edge);
              steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${edge.source}-${edge.target} added to candidates.` });
            }
        }
      });
    } else {
      // Both nodes already in MST or neither is (should not happen with correct candidate logic)
      steps.push({ type: "highlight-edge", edgeId: minEdge.id, color: "hsl(var(--muted))", descriptionForAI: `Edge ${minEdge.source}-${minEdge.target} forms a cycle or connects two non-MST nodes (skipped).` });
    }
  }

  // Final highlighting of MST
  if (mstEdges.length > 0 || (nodes.length === 1 && edges.length === 0)) {
    steps.push({ type: "message", message: "Prim's Algorithm complete. Minimum Spanning Tree (or forest component) is highlighted.", descriptionForAI: "Prim's algorithm finished. Final MST/forest component highlighted in accent color." });
    
    // Reset all non-MST edges and nodes
    nodes.forEach(node => {
        if (!mstNodes.has(node.id)) {
             steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--muted))" });
        }
    });
    edges.forEach(edge => {
        if (!mstEdges.find(e => e.id === edge.id)) {
             steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--border))" });
        }
    });
    
    mstEdges.forEach(edge => {
      steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--accent))", descriptionForAI: `Edge ${edge.source}-${edge.target} is part of the final MST.` });
    });
    mstNodes.forEach(nodeId => {
        steps.push({ type: "highlight-node", nodeId: nodeId, color: "hsl(var(--accent))", descriptionForAI: `Node ${nodeId} is part of the final MST.` });
    });

     if (nodes.length === 1 && mstEdges.length === 0) { // Single node graph
        steps.push({ type: "highlight-node", nodeId: nodes[0].id, color: "hsl(var(--accent))", descriptionForAI: `Node ${nodes[0].id} forms a trivial MST.` });
     }

  } else if (nodes.length > 0) {
     steps.push({ type: "message", message: "Prim's Algorithm complete. No MST found (e.g., graph has no edges or start node is isolated).", descriptionForAI: "Prim's algorithm finished. No MST formed." });
     nodes.forEach(node => steps.push({ type: "highlight-node", nodeId: node.id, color: "hsl(var(--muted))" }));
     edges.forEach(edge => steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--border))" }));
  }
  
  return steps;
}
