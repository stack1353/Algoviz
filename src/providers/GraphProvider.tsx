
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import type { Node, Edge, Graph, AlgorithmType, AnimationStep } from '@/types/graph';
import { dijkstra } from '@/algorithms/dijkstra';
import { prim } from '@/algorithms/prim';
import { kruskal } from '@/algorithms/kruskal';

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
}

const initialState: GraphState = {
  nodes: [],
  edges: [],
  selectedAlgorithm: null,
  animationSteps: [],
  currentStepIndex: -1,
  animationSpeed: 500,
  isAnimating: false,
  startNode: null,
  messages: [],
  currentVisualizationStateForAI: null,
  nextNodeId: 1,
  nextEdgeId: 1,
};

// Constants for random graph generation
const RANDOM_GRAPH_CANVAS_WIDTH = 760; // Logical canvas width for node placement
const RANDOM_GRAPH_CANVAS_HEIGHT = 560; // Logical canvas height
const NODE_RADIUS_PADDING = 30; // Padding from canvas edges and for node radius
const RANDOM_EDGE_PROBABILITY = 0.2; // Chance to create an edge between any two nodes

type Action =
  | { type: 'ADD_NODE'; payload: { x: number; y: number } }
  | { type: 'ADD_EDGE'; payload: { source: string; target: string; weight: number } }
  | { type: 'SET_ALGORITHM'; payload: AlgorithmType }
  | { type: 'SET_START_NODE'; payload: string | null }
  | { type: 'RUN_ALGORITHM' }
  | { type: 'ANIMATION_STEP_FORWARD' }
  | { type: 'TOGGLE_ANIMATION_PLAY_PAUSE' }
  | { type: 'SET_ANIMATION_SPEED'; payload: number }
  | { type: 'RESET_GRAPH' }
  | { type: 'RESET_ANIMATION' }
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'SET_EDGES'; payload: Edge[] }
  | { type: 'ADD_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'UPDATE_NODE_VISUALS'; payload: { nodeId: string; color?: string; label?: string } }
  | { type: 'UPDATE_EDGE_VISUALS'; payload: { edgeId: string; color?: string } }
  | { type: 'RESET_NODE_EDGE_VISUALS' }
  | { type: 'CLEAR_NODE_LABELS' }
  | { type: 'SET_VIS_STATE_AI', payload: string | null }
  | { type: 'CREATE_RANDOM_GRAPH'; payload: { numNodes: number; minWeight: number; maxWeight: number } };


const graphReducer = (state: GraphState, action: Action): GraphState => {
  switch (action.type) {
    case 'ADD_NODE':
      const newNodeId = `node-${state.nextNodeId}`;
      const newNode: Node = { id: newNodeId, x: action.payload.x, y: action.payload.y, label: `N${state.nextNodeId}` };
      return { ...state, nodes: [...state.nodes, newNode], nextNodeId: state.nextNodeId + 1, messages: [] };
    case 'ADD_EDGE':
      if (state.edges.some(e => 
        (e.source === action.payload.source && e.target === action.payload.target) ||
        (e.source === action.payload.target && e.target === action.payload.source && !e.isDirected)
      )) {
        return { ...state, messages: [...state.messages, "Edge already exists or overlaps."] };
      }
      const newEdgeId = `edge-${state.nextEdgeId}`;
      const newEdge: Edge = { id: newEdgeId, ...action.payload, isDirected: state.selectedAlgorithm === 'dijkstra' };
      return { ...state, edges: [...state.edges, newEdge], nextEdgeId: state.nextEdgeId + 1, messages: [] };
    case 'SET_ALGORITHM':
      const updatedEdgesForAlgo = state.edges.map(edge => ({
        ...edge,
        isDirected: action.payload === 'dijkstra'
      }));
      return { ...state, selectedAlgorithm: action.payload, animationSteps: [], currentStepIndex: -1, isAnimating: false, messages: [], edges: updatedEdgesForAlgo };
    case 'SET_START_NODE':
      return { ...state, startNode: action.payload };
    case 'RUN_ALGORITHM':
      if (!state.selectedAlgorithm) return state;
      let steps: AnimationStep[] = [];
      const currentGraph = { nodes: state.nodes, edges: state.edges.map(e => ({...e, isDirected: state.selectedAlgorithm === 'dijkstra'})) };
      
      if (state.selectedAlgorithm === 'dijkstra' && state.startNode) {
        steps = dijkstra(currentGraph, state.startNode);
      } else if (state.selectedAlgorithm === 'prim') {
        steps = prim(currentGraph);
      } else if (state.selectedAlgorithm === 'kruskal') {
        steps = kruskal(currentGraph);
      }
      return { ...state, animationSteps: steps, currentStepIndex: -1, isAnimating: steps.length > 0, messages: [], currentVisualizationStateForAI: null };
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
            newMessages = [currentStep.message, ...newMessages];
        } else if (currentStep.type === "reset-colors") {
            newNodes = newNodes.map(n => ({ ...n, color: undefined }));
            newEdges = newEdges.map(e => ({ ...e, color: undefined }));
        } else if (currentStep.type === "clear-labels") {
            newNodes = newNodes.map(n => ({ ...n, label: n.id.replace('node-', 'N') }));
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
        const resetNodes = state.nodes.map(n => ({ ...n, color: undefined, label: n.id.replace('node-', 'N') }));
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
      return { ...initialState, animationSpeed: state.animationSpeed };
    case 'RESET_ANIMATION':
        const baseLabelForReset = (nodeId: string) => {
            const parts = nodeId.split('-');
            return `N${parts[parts.length -1]}`;
        };
      return { 
        ...state, 
        currentStepIndex: -1, 
        isAnimating: false, 
        messages: [], 
        nodes: state.nodes.map(n => ({...n, color: undefined, label: baseLabelForReset(n.id) })),
        edges: state.edges.map(e => ({...e, color: undefined})),
        currentVisualizationStateForAI: null,
      };
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [action.payload, ...state.messages] };
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
        const baseLabelForClear = (nodeId: string) => {
            const parts = nodeId.split('-');
            return `N${parts[parts.length -1]}`;
        };
        return {
            ...state,
            nodes: state.nodes.map(n => ({ ...n, label: baseLabelForClear(n.id) })),
        };
    case 'SET_VIS_STATE_AI':
        return { ...state, currentVisualizationStateForAI: action.payload };
    case 'CREATE_RANDOM_GRAPH': {
        const { numNodes, minWeight, maxWeight } = action.payload;
        const newGeneratedNodes: Node[] = [];
        const newGeneratedEdges: Edge[] = [];

        let localNodeIdCounter = 1;
        let localEdgeIdCounter = 1;

        for (let i = 0; i < numNodes; i++) {
            const nodeId = `node-${localNodeIdCounter++}`;
            newGeneratedNodes.push({
                id: nodeId,
                x: NODE_RADIUS_PADDING + Math.random() * (RANDOM_GRAPH_CANVAS_WIDTH - 2 * NODE_RADIUS_PADDING),
                y: NODE_RADIUS_PADDING + Math.random() * (RANDOM_GRAPH_CANVAS_HEIGHT - 2 * NODE_RADIUS_PADDING),
                label: `N${i + 1}`
            });
        }

        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                if (Math.random() < RANDOM_EDGE_PROBABILITY) {
                    const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
                    const sourceNodeId = newGeneratedNodes[i].id;
                    const targetNodeId = newGeneratedNodes[j].id;
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
        const isDirectedCurrentAlgo = state.selectedAlgorithm === 'dijkstra';
        const finalEdges = newGeneratedEdges.map(edge => ({...edge, isDirected: isDirectedCurrentAlgo }));

        return {
            ...initialState, 
            animationSpeed: state.animationSpeed, 
            selectedAlgorithm: state.selectedAlgorithm, 
            nodes: newGeneratedNodes,
            edges: finalEdges,
            nextNodeId: localNodeIdCounter, 
            nextEdgeId: localEdgeIdCounter, 
            messages: [`Generated random graph with ${numNodes} nodes.`],
            currentVisualizationStateForAI: null,
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

    