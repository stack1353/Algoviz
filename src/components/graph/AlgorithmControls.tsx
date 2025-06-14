
"use client";

import React, { useState, useEffect } from 'react';
import { useGraph } from '@/providers/GraphProvider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, StepForward, Shuffle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextualHelpDialog } from '@/components/ai/ContextualHelpDialog';
import type { AlgorithmType } from '@/types/graph';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AlgorithmControls() {
  const { state, dispatch } = useGraph();
  const { selectedAlgorithm, startNode, nodes, animationSpeed, isAnimating, animationSteps, currentStepIndex, selectedNodeId } = state;
  const [localStartNode, setLocalStartNode] = useState('');

  const [numRandomNodes, setNumRandomNodes] = useState<string>("8");
  const [minRandomWeight, setMinRandomWeight] = useState<string>("1");
  const [maxRandomWeight, setMaxRandomWeight] = useState<string>("10");


  useEffect(() => {
    if (startNode) setLocalStartNode(startNode);
    else setLocalStartNode('');
  }, [startNode]);

  const handleRunAlgorithm = () => {
    dispatch({ type: 'RESET_NODE_EDGE_VISUALS' });
    dispatch({ type: 'CLEAR_NODE_LABELS' });
    dispatch({ type: 'CLEAR_MESSAGES' });
    if (selectedAlgorithm === 'dijkstra' && !localStartNode) {
       toast({ title: "Missing Start Node", description: "Please select a start node for Dijkstra's algorithm.", variant: "destructive" });
      return;
    }
    if (selectedAlgorithm === 'dijkstra') {
      dispatch({ type: 'SET_START_NODE', payload: localStartNode });
    }
    dispatch({ type: 'RUN_ALGORITHM' });
  };
  
  const handleAnimationToggle = () => {
    if (isAnimating) {
        dispatch({ type: 'TOGGLE_ANIMATION_PLAY_PAUSE' });
    } else if (animationSteps.length > 0 && currentStepIndex < animationSteps.length -1) {
        dispatch({ type: 'ANIMATION_STEP_FORWARD' }); 
    } else if (animationSteps.length === 0){
        handleRunAlgorithm(); 
    } else {
      dispatch({ type: 'TOGGLE_ANIMATION_PLAY_PAUSE' }); 
    }
  };
  
  let animationInterval: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (isAnimating && state.currentStepIndex < state.animationSteps.length - 1) {
      animationInterval = setInterval(() => {
        dispatch({ type: 'ANIMATION_STEP_FORWARD' });
      }, animationSpeed);
    } else if (isAnimating && state.currentStepIndex >= state.animationSteps.length -1) {
      dispatch({ type: 'TOGGLE_ANIMATION_PLAY_PAUSE' }); 
    }
    
    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [isAnimating, animationSpeed, dispatch, state.currentStepIndex, state.animationSteps.length]);


  const handleResetGraph = () => {
    dispatch({ type: 'RESET_GRAPH' });
    setLocalStartNode('');
  };
  
  const handleResetAnimation = () => {
    dispatch({ type: 'RESET_ANIMATION' });
  };

  const handleGenerateRandomGraph = () => {
    const numNodesVal = parseInt(numRandomNodes, 10);
    const minWeightVal = parseInt(minRandomWeight, 10);
    const maxWeightVal = parseInt(maxRandomWeight, 10);

    if (isNaN(numNodesVal) || numNodesVal <= 1 || numNodesVal > 50) {
      toast({ title: "Invalid Node Count", description: "Number of nodes must be between 2 and 50.", variant: "destructive" });
      return;
    }
    if (isNaN(minWeightVal) || minWeightVal <= 0) {
      toast({ title: "Invalid Min Weight", description: "Minimum weight must be a positive number.", variant: "destructive" });
      return;
    }
    if (isNaN(maxWeightVal) || maxWeightVal <= 0) {
      toast({ title: "Invalid Max Weight", description: "Maximum weight must be a positive number.", variant: "destructive" });
      return;
    }
    if (minWeightVal > maxWeightVal) {
      toast({ title: "Invalid Weight Range", description: "Minimum weight cannot exceed maximum weight.", variant: "destructive" });
      return;
    }

    dispatch({ type: 'CREATE_RANDOM_GRAPH', payload: { numNodes: numNodesVal, minWeight: minWeightVal, maxWeight: maxWeightVal } });
    toast({ title: "Graph Generated", description: `Generated a random graph with ${numNodesVal} nodes.` });
  };

  const handleDeleteSelectedNode = () => {
    if (selectedNodeId) {
      dispatch({ type: 'DELETE_NODE', payload: { nodeId: selectedNodeId } });
      toast({ title: "Node Deleted", description: `Node ${selectedNodeId} has been deleted.` });
    } else {
      toast({ title: "No Node Selected", description: "Click on a node in the canvas to select it for deletion.", variant: "destructive"});
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="algorithm-select">Algorithm</Label>
          <Select
            value={selectedAlgorithm || undefined}
            onValueChange={(value) => dispatch({ type: 'SET_ALGORITHM', payload: value as AlgorithmType })}
          >
            <SelectTrigger id="algorithm-select">
              <SelectValue placeholder="Select Algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
              <SelectItem value="prim">Prim's Algorithm</SelectItem>
              <SelectItem value="kruskal">Kruskal's Algorithm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedAlgorithm === 'dijkstra' && (
          <div className="space-y-2">
            <Label htmlFor="start-node">Start Node</Label>
            <Select
              value={localStartNode || undefined}
              onValueChange={(value) => setLocalStartNode(value)}
              disabled={nodes.length === 0}
            >
              <SelectTrigger id="start-node">
                <SelectValue placeholder="Select Start Node" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label || node.id.replace('node-', 'N')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="speed-slider">Animation Speed: {animationSpeed}ms</Label>
          <Slider
            id="speed-slider"
            min={100}
            max={2000}
            step={100}
            value={[animationSpeed]}
            onValueChange={(value) => dispatch({ type: 'SET_ANIMATION_SPEED', payload: value[0] })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleRunAlgorithm} disabled={!selectedAlgorithm || (animationSteps.length > 0 && isAnimating)}>
            <Play className="mr-2 h-4 w-4" /> Run
          </Button>
           <Button onClick={handleAnimationToggle} variant="outline" disabled={animationSteps.length === 0}>
            {isAnimating ? <Pause className="mr-2 h-4 w-4" /> : <StepForward className="mr-2 h-4 w-4" />}
            {isAnimating ? "Pause" : (currentStepIndex < animationSteps.length -1 && currentStepIndex !== -1 ? "Next Step" : "Play Steps")}
          </Button>
        </div>
         <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleResetAnimation} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Sim
          </Button>
          <Button onClick={handleResetGraph} variant="destructive">
            <Zap className="mr-2 h-4 w-4" /> Clear Graph
          </Button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={!selectedNodeId}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected Node
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete node {selectedNodeId && (nodes.find(n=>n.id===selectedNodeId)?.label || selectedNodeId)} and all its connected edges. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelectedNode} className={buttonVariants({variant: "destructive"})}>
                Delete Node
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <ContextualHelpDialog />

        <Separator className="my-4" />

        <div className="space-y-3">
          <h3 className="text-md font-semibold font-headline">Random Graph Generator</h3>
          <div className="space-y-1">
            <Label htmlFor="num-random-nodes">Number of Nodes (2-50)</Label>
            <Input 
              id="num-random-nodes" 
              type="number" 
              value={numRandomNodes} 
              onChange={(e) => setNumRandomNodes(e.target.value)}
              min="2"
              max="50"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="min-random-weight">Min Weight</Label>
              <Input 
                id="min-random-weight" 
                type="number" 
                value={minRandomWeight} 
                onChange={(e) => setMinRandomWeight(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-random-weight">Max Weight</Label>
              <Input 
                id="max-random-weight" 
                type="number" 
                value={maxRandomWeight} 
                onChange={(e) => setMaxRandomWeight(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <Button onClick={handleGenerateRandomGraph} className="w-full" variant="secondary">
            <Shuffle className="mr-2 h-4 w-4" /> Generate Random Graph
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

// Helper for AlertDialog button styling
const buttonVariants = ({ variant }: { variant: "destructive" | "default" | null | undefined }) => {
  if (variant === "destructive") return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  return "bg-primary text-primary-foreground hover:bg-primary/90";
};
