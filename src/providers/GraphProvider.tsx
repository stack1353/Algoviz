
"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Node, Edge, Graph, AlgorithmType, AnimationStep, ApplicationGraphData } from '@/types/graph';
import { dijkstra } from '@/algorithms/dijkstra';
import { prim } from '@/algorithms/prim';
import { kruskal } from '@/algorithms/kruskal';
import { applicationGraphs } from '@/data/application-graphs';

interface GraphState extends Graph {
  selectedAlgorithm: AlgorithmType;
  animationSteps: AnimationStep[];
  currentStepIndex: number;
  animationSpeed: number; // ms per step
  isAnimating: boolean;
  startNode: string | null; // For Dijkstra
  messages: string[];
  currentVisualizationStateForAI: string | null;
  nextNodeId: number;
  nextEdgeId: number;
  selectedNodeId: string | null;
  selectedEdgeId: string | null; // For editing/deleting
  currentApplicationId: string | null;
}

const initialState: GraphState = {
  nodes: [],
  edges: [],
  selectedAlgorithm: "none",
  animationSteps: [],
  currentStepIndex: -1,
  animationSpeed: 500,
  isAnimating: false,
  startNode: null,
  messages: [],
  currentVisualizationStateForAI: null,
  nextNodeId: 1,
  nextEdgeId: 1,
  selectedNodeId: null,
  selectedEdgeId: null,
  currentApplicationId: null,
};

// Constants for random graph generation
const RANDOM_GRAPH_CANVAS_WIDTH = 760; 
const RANDOM_GRAPH_CANVAS_HEIGHT = 560; 
const NODE_RADIUS_PADDING = 40; 
const RANDOM_EDGE_PROBABILITY_ADDITIONAL = 0.15; 


type Action =
  | { type: 'ADD_NODE'; payload: { x: number; y: number } }
  | { type: 'ADD_EDGE'; payload: { source: string; target: string; weight: number; isDirected: boolean } }
  | { type: 'DELETE_NODE'; payload: { nodeId: string } }
  | { type: 'SET_SELECTED_NODE'; payload: string | null }
  | { type: 'DELETE_EDGE'; payload: { edgeId: string } }
  | { type: 'UPDATE_EDGE_WEIGHT'; payload: { edgeId: string; newWeight: number } }
  | { type: 'SET_SELECTED_EDGE'; payload: string | null }
  | { type: 'SET_ALGORITHM'; payload: AlgorithmType }
  | { type: 'SET_START_NODE'; payload: string | null }
  | { type: 'RUN_ALGORITHM' }
  | { type: 'ANIMATION_STEP_FORWARD' }
  | { type: 'TOGGLE_ANIMATION_PLAY_PAUSE' }
  | { type: 'SET_ANIMATION_SPEED'; payload: number }
  | { type: 'RESET_GRAPH' }
  | { type: 'RESET_ANIMATION' }
  | { type: 'ADD_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'UPDATE_NODE_VISUALS'; payload: { nodeId: string; color?: string; label?: string } }
  | { type: 'UPDATE_EDGE_VISUALS'; payload: { edgeId: string; color?: string } }
  | { type: 'RESET_NODE_EDGE_VISUALS' }
  | { type: 'CLEAR_NODE_LABELS' }
  | { type: 'SET_VIS_STATE_AI', payload: string | null }
  | { type: 'CREATE_RANDOM_GRAPH'; payload: { numNodes: number; minWeight: number; maxWeight: number } }
  | { type: 'SET_EXTRACTED_GRAPH'; payload: { nodes: Node[]; edges: Edge[]; nextNodeId: number; nextEdgeId: number } }
  | { type: 'LOAD_APPLICATION_GRAPH'; payload: { applicationId: string } };


const graphReducer = (state: GraphState, action: Action): GraphState => {
  switch (action.type) {
    case 'ADD_NODE':
      const newNodeId = `node-${state.nextNodeId}`;
      const newNode: Node = { id: newNodeId, x: action.payload.x, y: action.payload.y, label: `N${state.nextNodeId}` };
      return { 
        ...state, 
        nodes: [...state.nodes, newNode], 
        nextNodeId: state.nextNodeId + 1, 
        messages: [],
        selectedNodeId: newNodeId, 
        selectedEdgeId: null,
        animationSteps: [], currentStepIndex: -1, isAnimating: false, 
        currentApplicationId: null, 
      };
    case 'ADD_EDGE':
      if (state.edges.some(e => 
        (e.source === action.payload.source && e.target === action.payload.target) ||
        (e.source === action.payload.target && e.target === action.payload.source && !e.isDirected && !action.payload.isDirected)
      )) {
        return { ...state, messages: [...state.messages, "Edge already exists or overlaps with an undirected edge."] };
      }
      const newEdgeId = `edge-${state.nextEdgeId}`;
      const newEdge: Edge = { 
        id: newEdgeId, 
        source: action.payload.source, 
        target: action.payload.target, 
        weight: action.payload.weight,
        isDirected: action.payload.isDirected 
      };
      return { 
        ...state, 
        edges: [...state.edges, newEdge], 
        nextEdgeId: state.nextEdgeId + 1, 
        messages: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        animationSteps: [], currentStepIndex: -1, isAnimating: false, 
        currentApplicationId: null, 
      };
    case 'DELETE_NODE': {
      const { nodeId } = action.payload;
      const remainingNodes = state.nodes.filter(node => node.id !== nodeId);
      const remainingEdges = state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
      
      let newStartNode = state.startNode;
      if (state.startNode === nodeId) {
        newStartNode = null; 
      }

      return {
        ...state,
        nodes: remainingNodes,
        edges: remainingEdges,
        selectedNodeId: null,
        selectedEdgeId: null,
        startNode: newStartNode,
        animationSteps: [], 
        currentStepIndex: -1,
        isAnimating: false,
        messages: [`Node ${nodeId} and its edges deleted.`],
        currentVisualizationStateForAI: null,
        currentApplicationId: null, 
      };
    }
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNodeId: action.payload, selectedEdgeId: null };
    case 'SET_SELECTED_EDGE':
      return { ...state, selectedEdgeId: action.payload, selectedNodeId: null };
    case 'DELETE_EDGE':
      return {
        ...state,
        edges: state.edges.filter(edge => edge.id !== action.payload.edgeId),
        selectedEdgeId: null,
      };
    case 'UPDATE_EDGE_WEIGHT':
      return {
        ...state,
        edges: state.edges.map(edge =>
          edge.id === action.payload.edgeId
            ? { ...edge, weight: action.payload.newWeight }
            : edge
        ),
        selectedEdgeId: null,
      };
    case 'SET_ALGORITHM':
      return { ...state, selectedAlgorithm: action.payload, animationSteps: [], currentStepIndex: -1, isAnimating: false, messages: [], selectedNodeId: null, selectedEdgeId: null };
    case 'SET_START_NODE':
      return { ...state, startNode: action.payload };
    case 'RUN_ALGORITHM':
      if (!state.selectedAlgorithm || state.selectedAlgorithm === "none") return state;
      let steps: AnimationStep[] = [];
      const currentGraph = { nodes: state.nodes, edges: state.edges }; 
      
      if (state.selectedAlgorithm === 'dijkstra' && state.startNode) {
        steps = dijkstra(currentGraph, state.startNode);
      } else if (state.selectedAlgorithm === 'prim') {
        steps = prim(currentGraph);
      } else if (state.selectedAlgorithm === 'kruskal') {
        steps = kruskal(currentGraph);
      }
      return { ...state, animationSteps: steps, currentStepIndex: -1, isAnimating: steps.length > 0, messages: [], currentVisualizationStateForAI: null, selectedNodeId: null, selectedEdgeId: null };
    case 'ANIMATION_STEP_FORWARD':
      if (state.currentStepIndex < state.animationSteps.length - 1) {
        const nextStepIndex = state.currentStepIndex + 1;
        const currentStep = state.animationSteps[nextStepIndex];
        let newNodes = [...state.nodes];
        let newEdges = [...state.edges];
        let newMessages = [...state.messages];
        let newVisStateAI = state.currentVisualizationStateForAI;

        if(currentStep.descriptionForAI) {
          newVisStateAI = currentStep.descriptionForAI;
        }

        if (currentStep.type === "highlight-node" && currentStep.nodeId) {
            newNodes = newNodes.map(n => n.id === currentStep.nodeId ? { ...n, color: currentStep.color || 'hsl(var(--primary))' } : n);
        } else if (currentStep.type === "highlight-edge" && currentStep.edgeId) {
            newEdges = newEdges.map(e => e.id === currentStep.edgeId ? { ...e, color: currentStep.color || 'hsl(var(--primary))' } : e);
        } else if (currentStep.type === "update-node-label" && currentStep.nodeId) {
            newNodes = newNodes.map(n => n.id === currentStep.nodeId ? { ...n, label: currentStep.label } : n);
        } else if (currentStep.type === "message" && currentStep.message) {
            newMessages = [currentStep.message, ...newMessages.slice(0, 99)]; 
        } else if (currentStep.type === "reset-colors") {
            newNodes = newNodes.map(n => ({ ...n, color: undefined }));
            newEdges = newEdges.map(e => ({ ...e, color: undefined }));
        } else if (currentStep.type === "clear-labels") {
            const baseLabel = (nodeId: string, appNodes?: Node[]) => {
                const appNode = appNodes?.find(n => n.id === nodeId);
                return appNode?.label || nodeId.replace('node-', 'N');
            };
            const appGraphData = state.currentApplicationId ? applicationGraphs[state.currentApplicationId] : undefined;
            newNodes = newNodes.map(n => ({ ...n, label: baseLabel(n.id, appGraphData?.nodes) }));
        }
        
        return { 
            ...state, 
            currentStepIndex: nextStepIndex, 
            isAnimating: nextStepIndex < state.animationSteps.length - 1 ? state.isAnimating : false,
            nodes: newNodes,
            edges: newEdges,
            messages: newMessages,
            currentVisualizationStateForAI: newVisStateAI,
        };
      }
      return { ...state, isAnimating: false };
    case 'TOGGLE_ANIMATION_PLAY_PAUSE':
      if (state.animationSteps.length === 0) return state;
      if (!state.isAnimating && state.currentStepIndex >= state.animationSteps.length -1) {
        const baseLabelForToggle = (nodeId: string, appNodes?: Node[]) => {
            const appNode = appNodes?.find(n => n.id === nodeId);
            return appNode?.label || nodeId.replace('node-', 'N');
        };
        const appGraphData = state.currentApplicationId ? applicationGraphs[state.currentApplicationId] : undefined;
        const resetNodes = state.nodes.map(n => ({ ...n, color: undefined, label: baseLabelForToggle(n.id, appGraphData?.nodes) }));
        const resetEdges = state.edges.map(e => ({ ...e, color: undefined}));
        return {
          ...state,
          currentStepIndex: -1,
          isAnimating: true,
          messages: [],
          nodes: resetNodes,
          edges: resetEdges,
          currentVisualizationStateForAI: null,
        };
      }
      return { ...state, isAnimating: !state.isAnimating };
    case 'SET_ANIMATION_SPEED':
      return { ...state, animationSpeed: action.payload };
    case 'RESET_GRAPH':
      return { 
        ...initialState,
        selectedAlgorithm: state.selectedAlgorithm,
        animationSpeed: state.animationSpeed,
        startNode: null,
        currentApplicationId: null,
      };
    case 'RESET_ANIMATION':
        const baseLabelForReset = (nodeId: string, appNodes?: Node[]) => {
            const appNode = appNodes?.find(n => n.id === nodeId);
            return appNode?.label || nodeId.replace('node-','N');
        };
        const appGraphDataForReset = state.currentApplicationId ? applicationGraphs[state.currentApplicationId] : undefined;

      return { 
        ...state, 
        currentStepIndex: -1, 
        isAnimating: false, 
        messages: [], 
        nodes: state.nodes.map(n => ({...n, color: undefined, label: baseLabelForReset(n.id, appGraphDataForReset?.nodes) })),
        edges: state.edges.map(e => ({...e, color: undefined})),
        currentVisualizationStateForAI: null,
        selectedNodeId: null,
        selectedEdgeId: null,
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [action.payload, ...state.messages.slice(0,99)] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'UPDATE_NODE_VISUALS':
       return { ...state, nodes: state.nodes.map(n => n.id === action.payload.nodeId ? { ...n, color: action.payload.color ?? n.color, label: action.payload.label ?? n.label } : n) };
    case 'UPDATE_EDGE_VISUALS':
       return { ...state, edges: state.edges.map(e => e.id === action.payload.edgeId ? { ...e, color: action.payload.color ?? e.color } : e) };
    case 'RESET_NODE_EDGE_VISUALS':
        return {
            ...state,
            nodes: state.nodes.map(n => ({ ...n, color: undefined })),
            edges: state.edges.map(e => ({ ...e, color: undefined })),
        };
    case 'CLEAR_NODE_LABELS':
        const baseLabelForClear = (nodeId: string, appNodes?: Node[]) => {
            const appNode = appNodes?.find(n => n.id === nodeId);
            return appNode?.label || nodeId.replace('node-', 'N');
        };
        const appGraphDataForClear = state.currentApplicationId ? applicationGraphs[state.currentApplicationId] : undefined;
        return {
            ...state,
            nodes: state.nodes.map(n => ({ ...n, label: baseLabelForClear(n.id, appGraphDataForClear?.nodes) })),
        };
    case 'SET_VIS_STATE_AI':
        return { ...state, currentVisualizationStateForAI: action.payload };
    case 'CREATE_RANDOM_GRAPH': {
        const { numNodes, minWeight, maxWeight } = action.payload;
        const newGeneratedNodes: Node[] = [];
        let newGeneratedEdges: Edge[] = [];

        let localNodeIdCounter = 1; 
        let localEdgeIdCounter = 1;
        
        for (let i = 0; i < numNodes; i++) {
            const nodeId = `node-${localNodeIdCounter}`;
            newGeneratedNodes.push({
                id: nodeId,
                x: NODE_RADIUS_PADDING + Math.random() * (RANDOM_GRAPH_CANVAS_WIDTH - 2 * NODE_RADIUS_PADDING),
                y: NODE_RADIUS_PADDING + Math.random() * (RANDOM_GRAPH_CANVAS_HEIGHT - 2 * NODE_RADIUS_PADDING),
                label: `N${localNodeIdCounter}` 
            });
            localNodeIdCounter++;
        }

        if (numNodes > 1) {
            for (let i = 0; i < numNodes; i++) {
                const sourceNodeId = newGeneratedNodes[i].id;
                const targetNodeId = newGeneratedNodes[(i + 1) % numNodes].id; 
                
                const edgeExists = newGeneratedEdges.some(e => 
                    (e.source === sourceNodeId && e.target === targetNodeId) ||
                    (e.source === targetNodeId && e.target === sourceNodeId)
                );

                if (!edgeExists) {
                    const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
                    const edgeId = `edge-${localEdgeIdCounter++}`;
                    newGeneratedEdges.push({
                        id: edgeId,
                        source: sourceNodeId,
                        target: targetNodeId,
                        weight: weight,
                        isDirected: false 
                    });
                }
            }
        }

        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                if (Math.random() < RANDOM_EDGE_PROBABILITY_ADDITIONAL) {
                    const sourceNodeId = newGeneratedNodes[i].id;
                    const targetNodeId = newGeneratedNodes[j].id;
                    
                    const edgeExists = newGeneratedEdges.some(e => 
                        (e.source === sourceNodeId && e.target === targetNodeId) ||
                        (e.source === targetNodeId && e.target === sourceNodeId)
                    );

                    if (!edgeExists) {
                        const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
                        const edgeId = `edge-${localEdgeIdCounter++}`;
                        newGeneratedEdges.push({
                            id: edgeId,
                            source: sourceNodeId,
                            target: targetNodeId,
                            weight: weight,
                            isDirected: false
                        });
                    }
                }
            }
        }

        return {
            ...initialState, 
            selectedAlgorithm: state.selectedAlgorithm,
            animationSpeed: state.animationSpeed,
            nodes: newGeneratedNodes,
            edges: newGeneratedEdges,
            nextNodeId: localNodeIdCounter, 
            nextEdgeId: localEdgeIdCounter, 
            messages: [`Generated random graph with ${numNodes} nodes.`],
            currentVisualizationStateForAI: null,
            selectedNodeId: null,
            selectedEdgeId: null,
            currentApplicationId: null,
        };
    }
    case 'SET_EXTRACTED_GRAPH': {
        const { nodes: extractedNodes, edges: extractedEdges, nextNodeId: newNextNodeId, nextEdgeId: newNextEdgeId } = action.payload;
        return {
            ...initialState, 
            selectedAlgorithm: state.selectedAlgorithm,
            animationSpeed: state.animationSpeed,
            nodes: extractedNodes,
            edges: extractedEdges,
            nextNodeId: newNextNodeId,
            nextEdgeId: newNextEdgeId,
            messages: [`Graph extracted from image. Note: AI generation may not be 100% accurate. The graph is now fully editable.`],
            currentVisualizationStateForAI: "Graph loaded from image. The user has been notified that the extracted graph is an editable approximation.",
            selectedNodeId: null,
            selectedEdgeId: null,
            isAnimating: false,
            currentStepIndex: -1,
            animationSteps: [],
            currentApplicationId: null,
        };
    }
    case 'LOAD_APPLICATION_GRAPH': {
      const { applicationId } = action.payload;
      const appData = applicationGraphs[applicationId];
      if (!appData) return state; 

      const newNodes = appData.nodes.map(n => ({...n}));
      const newEdges = appData.edges.map(e => ({...e}));

      return {
        ...initialState, 
        animationSpeed: state.animationSpeed, 
        nodes: newNodes,
        edges: newEdges,
        selectedAlgorithm: appData.algorithm,
        startNode: appData.startNode || null,
        nextNodeId: appData.nextNodeId || newNodes.length + 1,
        nextEdgeId: appData.nextEdgeId || newEdges.length + 1,
        messages: [`Loaded application: ${appData.description}`],
        currentVisualizationStateForAI: `Viewing ${appData.description}`,
        currentApplicationId: applicationId,
      };
    }
    default:
      return state;
  }
};

const GraphContext = createContext<{ state: GraphState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};
