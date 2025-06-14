
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
  
  // Start with the first node (or a user-selected one in a full implementation)
  const startNode = nodes[0];
  mstNodes.add(startNode.id);
  steps.push({ type: "highlight-node", nodeId: startNode.id, color: "hsl(var(--primary))", descriptionForAI: `Node ${startNode.id} selected as starting point for MST.` });

  // Placeholder: Simulate finding a few edges for the MST
  // A real implementation uses a priority queue to find the minimum weight edge connecting MST to non-MST nodes.
  let edgesAdded = 0;
  const maxEdgesInMST = nodes.length -1;

  // Iteratively add edges (simplified placeholder logic)
  for(let i = 0; i < nodes.length && edgesAdded < maxEdgesInMST; i++) {
      if (mstNodes.size === nodes.length) break; // All nodes in MST

      let minEdge: Edge | null = null;
      let minWeight = Infinity;

      // Find cheapest edge from an MST node to a non-MST node
      edges.forEach(edge => {
          const inMstSource = mstNodes.has(edge.source);
          const inMstTarget = mstNodes.has(edge.target);

          if (inMstSource && !inMstTarget) { // Source in MST, Target not
              if (edge.weight < minWeight) {
                  minWeight = edge.weight;
                  minEdge = edge;
              }
          } else if (!inMstSource && inMstTarget) { // Target in MST, Source not
               if (edge.weight < minWeight) {
                  minWeight = edge.weight;
                  minEdge = edge;
              }
          }
      });
      
      if (minEdge) {
          steps.push({ type: "highlight-edge", edgeId: minEdge.id, color: "hsl(var(--secondary))", descriptionForAI: `Considering edge ${minEdge.source}-${minEdge.target} (weight ${minEdge.weight}).` });
          mstEdges.push(minEdge);
          
          const newNodeId = mstNodes.has(minEdge.source) ? minEdge.target : minEdge.source;
          mstNodes.add(newNodeId);
          
          steps.push({ type: "highlight-node", nodeId: newNodeId, color: "hsl(var(--primary))", descriptionForAI: `Node ${newNodeId} added to MST.` });
          steps.push({ type: "highlight-edge", edgeId: minEdge.id, color: "hsl(var(--secondary))", descriptionForAI: `Edge ${minEdge.source}-${minEdge.target} added to MST (simulation).` });
          edgesAdded++;
      } else {
          // No more edges can be added (e.g. disconnected graph part)
          break;
      }
  }


  // Final highlighting of MST
  if (mstEdges.length > 0 || (nodes.length === 1 && edges.length === 0)) {
    steps.push({ type: "message", message: "Prim's Algorithm complete. Minimum Spanning Tree (or forest component) is highlighted.", descriptionForAI: "Prim's algorithm finished. Final MST/forest component highlighted in accent color." });
    mstEdges.forEach(edge => {
      steps.push({ type: "highlight-edge", edgeId: edge.id, color: "hsl(var(--accent))", descriptionForAI: `Edge ${edge.source}-${edge.target} is part of the final MST.` });
      // Highlight nodes connected by these MST edges
       if(mstNodes.has(edge.source)){
         steps.push({ type: "highlight-node", nodeId: edge.source, color: "hsl(var(--accent))", descriptionForAI: `Node ${edge.source} is part of the final MST.` });
       }
       if(mstNodes.has(edge.target)){
         steps.push({ type: "highlight-node", nodeId: edge.target, color: "hsl(var(--accent))", descriptionForAI: `Node ${edge.target} is part of the final MST.` });
       }
    });
    // Ensure all nodes that became part of MST (even if by single node addition) are highlighted
     mstNodes.forEach(nodeId => {
        steps.push({ type: "highlight-node", nodeId: nodeId, color: "hsl(var(--accent))", descriptionForAI: `Node ${nodeId} is part of the final MST.` });
     });
     if (nodes.length === 1 && mstEdges.length === 0) {
        steps.push({ type: "highlight-node", nodeId: nodes[0].id, color: "hsl(var(--accent))", descriptionForAI: `Node ${nodes[0].id} forms a trivial MST.` });
     }

  } else if (nodes.length > 0) {
     steps.push({ type: "message", message: "Prim's Algorithm complete. No MST found (e.g., graph has no edges or start node is isolated).", descriptionForAI: "Prim's algorithm finished. No MST formed." });
  }
  
  return steps;
}
