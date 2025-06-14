
"use client";

import React, { useState, useEffect } from 'react';
import { useGraph } from '@/providers/GraphProvider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, StepForward, FastForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextualHelpDialog } from '@/components/ai/ContextualHelpDialog';
import type { AlgorithmType } from '@/types/graph';

export function AlgorithmControls() {
  const { state, dispatch } = useGraph();
  const { selectedAlgorithm, startNode, nodes, animationSpeed, isAnimating, animationSteps, currentStepIndex } = state;
  const [localStartNode, setLocalStartNode] = useState('');

  useEffect(() => {
    if (startNode) setLocalStartNode(startNode);
  }, [startNode]);

  const handleRunAlgorithm = () => {
    dispatch({ type: 'RESET_NODE_EDGE_VISUALS' });
    dispatch({ type: 'CLEAR_NODE_LABELS' });
    dispatch({ type: 'CLEAR_MESSAGES' });
    if (selectedAlgorithm === 'dijkstra' && !localStartNode) {
      alert("Please select a start node for Dijkstra's algorithm.");
      return;
    }
    if (selectedAlgorithm === 'dijkstra') {
      dispatch({ type: 'SET_START_NODE', payload: localStartNode });
    }
    dispatch({ type: 'RUN_ALGORITHM' });
  };
  
  const handleAnimationToggle = () => {
    if (isAnimating) {
        // This would effectively pause if animation is driven by external timer
        // For now, we just toggle a conceptual 'isAnimating' state or re-run
        // A true pause/resume needs timer management in GraphProvider
        dispatch({ type: 'ANIMATION_STEP_FORWARD' }); // Placeholder action
    } else if (animationSteps.length > 0 && currentStepIndex < animationSteps.length -1) {
        dispatch({ type: 'ANIMATION_STEP_FORWARD' }); // To resume or step
    } else if (animationSteps.length === 0){
        handleRunAlgorithm(); // If no animation has started, run it
    }
  };
  
  let animationInterval: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (isAnimating && state.currentStepIndex < state.animationSteps.length - 1) {
      animationInterval = setInterval(() => {
        dispatch({ type: 'ANIMATION_STEP_FORWARD' });
      }, animationSpeed);
    } else if (animationInterval) {
      clearInterval(animationInterval);
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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <Button onClick={handleRunAlgorithm} disabled={!selectedAlgorithm || isAnimating}>
            <Play className="mr-2 h-4 w-4" /> Run
          </Button>
           <Button onClick={handleAnimationToggle} variant="outline" disabled={animationSteps.length === 0 && !isAnimating}>
            {isAnimating ? <Pause className="mr-2 h-4 w-4" /> : <StepForward className="mr-2 h-4 w-4" />}
            {isAnimating ? "Pause" : (currentStepIndex < animationSteps.length -1 && currentStepIndex !== -1 ? "Next Step" : "Step")}
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
        <ContextualHelpDialog />
      </CardContent>
    </Card>
  );
}
