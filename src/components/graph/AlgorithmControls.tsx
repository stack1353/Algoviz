
"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGraph } from '@/providers/GraphProvider';
import { Button, buttonVariants } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, StepForward, Shuffle, Trash2, ImageUp, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextualHelpDialog } from '@/components/ai/ContextualHelpDialog';
import type { AlgorithmType, Node as GraphNode, Edge as GraphEdge } from '@/types/graph';
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
import { extractGraphFromImage, type ExtractGraphFromImageInput, type ExtractGraphFromImageOutput, type ExtractedNode, type ExtractedEdge } from '@/ai/flows/extract-graph-from-image-flow';
import { Loader } from '@/components/ui/loader';
import { applicationGraphs } from '@/data/application-graphs';

const RANDOM_GRAPH_CANVAS_WIDTH = 800;
const RANDOM_GRAPH_CANVAS_HEIGHT = 600;
const NODE_RADIUS_PADDING = 50;
const MAX_IMAGE_DIMENSION = 1024;
const IMAGE_QUALITY = 0.8;

export default function AlgorithmControls() {
  const { state, dispatch } = useGraph();
  const { selectedAlgorithm, startNode, nodes, animationSpeed, isAnimating, animationSteps, currentStepIndex, selectedNodeId } = state;

  const [localStartNode, setLocalStartNode] = useState('');
  const [numRandomNodes, setNumRandomNodes] = useState("8");
  const [minRandomWeight, setMinRandomWeight] = useState("1");
  const [maxRandomWeight, setMaxRandomWeight] = useState("10");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isExtractingGraph, setIsExtractingGraph] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [prevModeQueryParam, setPrevModeQueryParam] = useState<string | null>(null);

  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const searchParams = useSearchParams();
  const modeQueryParam = searchParams.get('mode');
  const applicationQueryParam = searchParams.get('application');
  const algorithmQueryParam = searchParams.get('algorithm') as AlgorithmType;

  const effectiveMode = modeQueryParam || 'draw';

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialLoadDone && isMountedRef.current) {
      if (applicationQueryParam && applicationGraphs[applicationQueryParam]) {
        dispatch({ type: 'LOAD_APPLICATION_GRAPH', payload: { applicationId: applicationQueryParam } });
      } else {
        dispatch({ type: 'RESET_GRAPH' }); 
        if (algorithmQueryParam) {
          dispatch({ type: 'SET_ALGORITHM', payload: algorithmQueryParam });
        } else if (effectiveMode === 'draw') {
          dispatch({ type: 'SET_ALGORITHM', payload: 'none' });
        }
      }
      setInitialLoadDone(true);
      setPrevModeQueryParam(modeQueryParam); 
    }
  }, [applicationQueryParam, algorithmQueryParam, modeQueryParam, effectiveMode, dispatch, initialLoadDone]);

  useEffect(() => {
    if (initialLoadDone) {
      const newEffectiveMode = modeQueryParam || 'draw';
      const prevEffectiveMode = prevModeQueryParam || 'draw';

      if (newEffectiveMode !== prevEffectiveMode && !applicationQueryParam) {
        dispatch({ type: 'RESET_GRAPH' }); 
        setLocalStartNode('');
        setSelectedImageFile(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        if (newEffectiveMode === 'draw') {
          dispatch({ type: 'SET_ALGORITHM', payload: 'none' });
        }
      }
      setPrevModeQueryParam(modeQueryParam);
    }
  }, [modeQueryParam, initialLoadDone, applicationQueryParam, dispatch, prevModeQueryParam]);

  useEffect(() => {
    if (startNode) setLocalStartNode(startNode);
    else setLocalStartNode('');
  }, [startNode]);

  useEffect(() => {
    if (effectiveMode !== 'image' && selectedImageFile) {
      setSelectedImageFile(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }, [effectiveMode, selectedImageFile]);

  useEffect(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    if (isAnimating && state.currentStepIndex < state.animationSteps.length - 1) {
      animationIntervalRef.current = setInterval(() => {
        dispatch({ type: 'ANIMATION_STEP_FORWARD' });
      }, animationSpeed);
    }
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isAnimating, animationSpeed, dispatch, state.currentStepIndex, state.animationSteps.length]);

  const handleRunAlgorithm = () => {
    dispatch({ type: 'RESET_NODE_EDGE_VISUALS' });
    dispatch({ type: 'CLEAR_NODE_LABELS' });
    dispatch({ type: 'CLEAR_MESSAGES' });
    if (selectedAlgorithm === 'dijkstra' && !localStartNode) {
      toast({ title: "Missing Start Node", description: "Please select a start node for Dijkstra's algorithm.", variant: "destructive" });
      return;
    }
    if (selectedAlgorithm === 'dijkstra') {
      if(state.startNode !== localStartNode) {
          dispatch({ type: 'SET_START_NODE', payload: localStartNode });
      }
    }
    dispatch({ type: 'RUN_ALGORITHM' });
  };

  const handleAnimationToggle = () => {
    if (isAnimating) {
        dispatch({ type: 'TOGGLE_ANIMATION_PLAY_PAUSE' });
    } else if (animationSteps.length > 0 && currentStepIndex < animationSteps.length - 1) {
        dispatch({ type: 'ANIMATION_STEP_FORWARD' });
    } else if (animationSteps.length === 0 && selectedAlgorithm !== 'none'){
        handleRunAlgorithm();
    } else if (selectedAlgorithm !== 'none') {
      dispatch({ type: 'TOGGLE_ANIMATION_PLAY_PAUSE' });
    }
  };

  const handleResetFullGraph = () => {
    dispatch({ type: 'RESET_GRAPH' }); 
    if (effectiveMode === 'draw') { 
      dispatch({ type: 'SET_ALGORITHM', payload: 'none'});
    }
    setLocalStartNode('');
    setSelectedImageFile(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  const handleResetAnimation = () => {
    dispatch({ type: 'RESET_ANIMATION' });
  };

  const handleGenerateRandomGraph = () => {
    const numNodesVal = parseInt(numRandomNodes, 10);
    const minWeightVal = parseInt(minRandomWeight, 10);
    const maxWeightVal = parseInt(maxRandomWeight, 10);

    if (isNaN(numNodesVal) || numNodesVal < 2 || numNodesVal > 50) {
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
    setSelectedImageFile(null); // Ensure image mode is cleared
  };

  const handleDeleteSelectedNode = () => {
    if (selectedNodeId) {
      dispatch({ type: 'DELETE_NODE', payload: { nodeId: selectedNodeId } });
      toast({ title: "Node Deleted", description: `Node ${selectedNodeId} has been deleted.` });
    } else {
      toast({ title: "No Node Selected", description: "Click on a node in the canvas to select it for deletion.", variant: "destructive"});
    }
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImageFile(event.target.files[0]);
    } else {
      setSelectedImageFile(null);
    }
  };

  const resizeImage = (imageDataUri: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        let resizedDataUri = imageDataUri;

        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
            height = MAX_IMAGE_DIMENSION;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error("Could not get canvas context for resizing."));
          }
          ctx.drawImage(img, 0, 0, width, height);
          resizedDataUri = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        }
        resolve(resizedDataUri);
      };
      img.onerror = (_error) => {
        reject(new Error("Could not load image for resizing."));
      };
      img.src = imageDataUri;
    });
  };


  const handleExtractGraph = async () => {
    if (!selectedImageFile) {
      toast({ title: "No Image Selected", description: "Please select an image file first.", variant: "destructive" });
      return;
    }

    setIsExtractingGraph(true);
    toast({ title: "Processing Image", description: "AI is analyzing the graph image. This may take a moment..." });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImageFile);
      reader.onload = async () => {
        if (!isMountedRef.current) return;
        const originalImageDataUri = reader.result as string;
        let imageDataUriForAI = originalImageDataUri;

        try {
            imageDataUriForAI = await resizeImage(originalImageDataUri);
        } catch (resizeError) {
            toast({ title: "Image Resizing Failed", description: (resizeError as Error).message + " Using original image.", variant: "destructive" });
        }

        const input: ExtractGraphFromImageInput = { imageDataUri: imageDataUriForAI };
        const aiOutput: ExtractGraphFromImageOutput = await extractGraphFromImage(input);
        
        if (!isMountedRef.current) return;

        if (aiOutput.error || !aiOutput.nodes || aiOutput.nodes.length === 0) {
          toast({ title: "AI Extraction Failed", description: aiOutput.error || "Could not extract a graph from the image.", variant: "destructive" });
          setIsExtractingGraph(false);
          return;
        }

        const newNodes: GraphNode[] = [];
        const newEdges: GraphEdge[] = [];
        const aiIdToInternalIdMap = new Map<string, string>();
        let nodeIdCounter = state.nextNodeId; 
        let edgeIdCounter = state.nextEdgeId;
        let skippedEdges = 0;

        aiOutput.nodes.forEach((aiNode: ExtractedNode) => {
          // 1. Validate AI output to prevent errors
          const validatedX = Math.max(0, Math.min(1, aiNode.x || 0));
          const validatedY = Math.max(0, Math.min(1, aiNode.y || 0));
          
          const internalNodeId = `node-${nodeIdCounter++}`;
          aiIdToInternalIdMap.set(aiNode.id, internalNodeId);
          
          newNodes.push({
            id: internalNodeId,
            label: aiNode.label || `N${nodeIdCounter-1}`,
            x: NODE_RADIUS_PADDING + validatedX * (RANDOM_GRAPH_CANVAS_WIDTH - 2 * NODE_RADIUS_PADDING),
            y: NODE_RADIUS_PADDING + (1 - validatedY) * (RANDOM_GRAPH_CANVAS_HEIGHT - 2 * NODE_RADIUS_PADDING),
          });
        });

        aiOutput.edges.forEach((aiEdge: ExtractedEdge) => {
          const sourceInternalId = aiIdToInternalIdMap.get(aiEdge.sourceId);
          const targetInternalId = aiIdToInternalIdMap.get(aiEdge.targetId);

          if (sourceInternalId && targetInternalId) {
            let weight = 1;
            if (aiEdge.weight !== undefined && !isNaN(aiEdge.weight)) {
              weight = Math.max(1, Math.round(Math.abs(aiEdge.weight)));
            }
            
            newEdges.push({
              id: `edge-${edgeIdCounter++}`,
              source: sourceInternalId,
              target: targetInternalId,
              weight: weight,
              isDirected: aiEdge.isDirected || false,
            });
          } else {
            skippedEdges++;
          }
        });

        dispatch({ 
          type: 'SET_EXTRACTED_GRAPH', 
          payload: { 
            nodes: newNodes, 
            edges: newEdges, 
            nextNodeId: nodeIdCounter, 
            nextEdgeId: edgeIdCounter 
          } 
        });
        
        toast({
          title: "Graph Extracted & Ready for Editing!",
          description: "The AI-generated graph is an approximation. You can now click to add/delete nodes and edges to perfect it."
        });
        
        if (skippedEdges > 0) {
          toast({
            title: "Edge Connection Warning",
            description: `${skippedEdges} edges could not be connected to valid nodes.`,
            variant: "destructive"
          });
        }
        
        setSelectedImageFile(null); // Clear after successful extraction
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
      };
      reader.onerror = (_error) => {
        if (!isMountedRef.current) return;
        toast({ title: "File Read Error", description: "Could not read the image file.", variant: "destructive" });
        setIsExtractingGraph(false);
      };
    } catch (e) {
      if (!isMountedRef.current) return;
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during AI processing.";
      toast({ title: "AI Extraction Error", description: errorMessage, variant: "destructive" });
    } finally {
      if (isMountedRef.current) {
        setIsExtractingGraph(false);
      }
    }
  };

  const renderImageGraphSection = () => (
    <div className="pt-2 space-y-3">
       <h3 className="text-md font-semibold font-headline flex items-center">
          <ImageUp className="mr-2 h-5 w-5" /> Graph from Image (AI)
        </h3>
      <div className="space-y-1">
        <Label htmlFor="image-upload">Upload Graph Image</Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleImageFileChange}
          className="text-sm"
        />
        {selectedImageFile && <p className="text-xs text-muted-foreground">Selected: {selectedImageFile.name}</p>}
      </div>
      <Button onClick={handleExtractGraph} className="w-full" variant="secondary" disabled={!selectedImageFile || isExtractingGraph}>
        {isExtractingGraph ? <Loader size={16} className="mr-2"/> : <BrainCircuit className="mr-2 h-4 w-4" />}
        Process Image to Graph
      </Button>
    </div>
  );

  const renderRandomGraphSection = () => (
    <div className="pt-2 space-y-3">
      <h3 className="text-md font-semibold font-headline flex items-center">
        <Shuffle className="mr-2 h-5 w-5" /> Random Graph Generator
      </h3>
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
  );

  const handleAlgorithmChange = (value: AlgorithmType) => {
    dispatch({ type: 'SET_ALGORITHM', payload: value });
    if (value !== 'dijkstra' && state.startNode) {
      // dispatch({ type: 'SET_START_NODE', payload: null }); // Optionally clear start node if not Dijkstra
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
            value={selectedAlgorithm || "none"}
            onValueChange={handleAlgorithmChange}
          >
            <SelectTrigger id="algorithm-select" suppressHydrationWarning={true}>
              <SelectValue placeholder="Select Algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
              <SelectItem value="prim">Prim's Algorithm</SelectItem>
              <SelectItem value="kruskal">Kruskal's Algorithm</SelectItem>
              <SelectItem value="none">None (Manual Mode)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedAlgorithm === 'dijkstra' && (
          <div className="space-y-2">
            <Label htmlFor="start-node">Start Node</Label>
            <Select
              value={localStartNode || ""}
              onValueChange={(value) => setLocalStartNode(value)}
              disabled={nodes.length === 0 || selectedAlgorithm !== 'dijkstra'}
            >
              <SelectTrigger id="start-node" suppressHydrationWarning={true}>
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
            disabled={state.skipAnimation}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="skip-animation"
            checked={state.skipAnimation}
            onCheckedChange={(checked) => dispatch({ type: 'SET_SKIP_ANIMATION', payload: checked as boolean })}
          />
          <Label htmlFor="skip-animation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Skip to final result
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleRunAlgorithm}
            disabled={!selectedAlgorithm || selectedAlgorithm === "none" || (animationSteps.length > 0 && isAnimating)}
          >
            <Play className="mr-2 h-4 w-4" /> Run
          </Button>
            <Button onClick={handleAnimationToggle} variant="outline" disabled={animationSteps.length === 0 && selectedAlgorithm === "none" || state.skipAnimation}>
            {isAnimating ? <Pause className="mr-2 h-4 w-4" /> : <StepForward className="mr-2 h-4 w-4" />}
            {isAnimating ? "Pause" : (currentStepIndex < animationSteps.length -1 && currentStepIndex !== -1 ? "Next Step" : "Play Steps")}
          </Button>
        </div>
          <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleResetAnimation} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Sim
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive"><Zap className="mr-2 h-4 w-4" /> Clear Graph</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will permanently delete the current graph and any loaded application data. This cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetFullGraph} className={buttonVariants({variant: "destructive"})}>Clear Graph</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

        { (effectiveMode === 'image' || effectiveMode === 'random') && <Separator className="my-4" /> }
        { effectiveMode === 'image' && renderImageGraphSection() }
        { effectiveMode === 'random' && renderRandomGraphSection() }

      </CardContent>
    </Card>
  );
}
