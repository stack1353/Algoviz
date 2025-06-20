
"use client";

import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGraph } from '@/providers/GraphProvider';
import { Button, buttonVariants } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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


const RANDOM_GRAPH_CANVAS_WIDTH = 760; 
const RANDOM_GRAPH_CANVAS_HEIGHT = 560; 
const NODE_RADIUS_PADDING = 40;

const MAX_IMAGE_DIMENSION = 1024; 
const IMAGE_QUALITY = 0.8; 


export function AlgorithmControls() {
  const { state, dispatch } = useGraph();
  const { selectedAlgorithm, startNode, nodes, animationSpeed, isAnimating, animationSteps, currentStepIndex, selectedNodeId, nextNodeId: currentNextNodeId, nextEdgeId: currentNextEdgeId, currentApplicationId } = state;
  
  const [localStartNode, setLocalStartNode] = useState('');
  const [numRandomNodes, setNumRandomNodes] = useState<string>("8");
  const [minRandomWeight, setMinRandomWeight] = useState<string>("1");
  const [maxRandomWeight, setMaxRandomWeight] = useState<string>("10");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isExtractingGraph, setIsExtractingGraph] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);


  const searchParams = useSearchParams();
  const modeQueryParam = searchParams.get('mode');
  const applicationQueryParam = searchParams.get('application');
  const algorithmQueryParam = searchParams.get('algorithm') as AlgorithmType;

  useEffect(() => {
    if (!initialLoadDone) {
      if (applicationQueryParam && applicationGraphs[applicationQueryParam]) {
        dispatch({ type: 'LOAD_APPLICATION_GRAPH', payload: { applicationId: applicationQueryParam } });
        // The algorithm and startNode will be set by LOAD_APPLICATION_GRAPH from predefined data
      } else if (algorithmQueryParam) {
        dispatch({ type: 'SET_ALGORITHM', payload: algorithmQueryParam });
      }
      setInitialLoadDone(true);
    }
  }, [applicationQueryParam, algorithmQueryParam, dispatch, initialLoadDone]);
  
  useEffect(() => {
    if (startNode) setLocalStartNode(startNode);
    else setLocalStartNode('');
  }, [startNode]);

  useEffect(() => {
    if (modeQueryParam !== 'image' && selectedImageFile) {
        setSelectedImageFile(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }
  }, [modeQueryParam, selectedImageFile]);


  const handleRunAlgorithm = () => {
    dispatch({ type: 'RESET_NODE_EDGE_VISUALS' });
    dispatch({ type: 'CLEAR_NODE_LABELS' });
    dispatch({ type: 'CLEAR_MESSAGES' });
    if (selectedAlgorithm === 'dijkstra' && !localStartNode) {
       toast({ title: "Missing Start Node", description: "Please select a start node for Dijkstra's algorithm.", variant: "destructive" });
      return;
    }
    if (selectedAlgorithm === 'dijkstra') {
      // Ensure localStartNode is dispatched if it differs from context,
      // useful if user changed it after an application graph loaded
      if(state.startNode !== localStartNode) {
         dispatch({ type: 'SET_START_NODE', payload: localStartNode });
      }
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
    setSelectedImageFile(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
    // If we were on an application or specific mode, navigating to clean editor state might be good
    // router.push('/editor', { shallow: true }); // Or use window.history.pushState
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
    setSelectedImageFile(null);
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
      img.onerror = (error) => {
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
        const originalImageDataUri = reader.result as string;
        let imageDataUriForAI = originalImageDataUri;

        try {
            imageDataUriForAI = await resizeImage(originalImageDataUri);
        } catch (resizeError) {
            toast({ title: "Image Resizing Failed", description: (resizeError as Error).message + " Using original image.", variant: "destructive" });
        }
        
        const input: ExtractGraphFromImageInput = { imageDataUri: imageDataUriForAI };
        const aiOutput: ExtractGraphFromImageOutput = await extractGraphFromImage(input);

        if (aiOutput.error || !aiOutput.nodes || aiOutput.nodes.length === 0) {
          toast({ title: "AI Extraction Failed", description: aiOutput.error || "Could not extract a graph from the image.", variant: "destructive" });
          setIsExtractingGraph(false);
          return;
        }

        const newNodes: GraphNode[] = [];
        const newEdges: GraphEdge[] = [];
        const aiIdToInternalIdMap = new Map<string, string>();
        let nodeIdCounter = currentNextNodeId; // Use context's counter
        let edgeIdCounter = currentNextEdgeId; // Use context's counter

        aiOutput.nodes.forEach((aiNode: ExtractedNode) => {
          const internalNodeId = `node-${nodeIdCounter++}`;
          aiIdToInternalIdMap.set(aiNode.id, internalNodeId);
          newNodes.push({
            id: internalNodeId,
            label: aiNode.label || `N${nodeIdCounter-1}`,
            x: NODE_RADIUS_PADDING + aiNode.x * (RANDOM_GRAPH_CANVAS_WIDTH - 2 * NODE_RADIUS_PADDING),
            y: NODE_RADIUS_PADDING + (1 - aiNode.y) * (RANDOM_GRAPH_CANVAS_HEIGHT - 2 * NODE_RADIUS_PADDING), 
          });
        });
        
        aiOutput.edges.forEach((aiEdge: ExtractedEdge) => {
          const sourceInternalId = aiIdToInternalIdMap.get(aiEdge.sourceId);
          const targetInternalId = aiIdToInternalIdMap.get(aiEdge.targetId);

          if (sourceInternalId && targetInternalId) {
            newEdges.push({
              id: `edge-${edgeIdCounter++}`,
              source: sourceInternalId,
              target: targetInternalId,
              weight: aiEdge.weight !== undefined && aiEdge.weight > 0 ? aiEdge.weight : 1,
              isDirected: aiEdge.isDirected || false,
            });
          }
        });
        
        dispatch({ type: 'SET_EXTRACTED_GRAPH', payload: { nodes: newNodes, edges: newEdges, nextNodeId: nodeIdCounter, nextEdgeId: edgeIdCounter } });
        toast({ title: "Graph Extracted!", description: `Successfully processed the image and generated a graph with ${newNodes.length} nodes and ${newEdges.length} edges.` });
        setSelectedImageFile(null);
         const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
      };
      reader.onerror = (error) => {
        toast({ title: "File Read Error", description: "Could not read the image file.", variant: "destructive" });
        setIsExtractingGraph(false);
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during AI processing.";
      toast({ title: "AI Extraction Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsExtractingGraph(false);
    }
  };

  const renderImageGraphSection = () => (
    <div className="pt-2 space-y-3">
       <h3 className="text-md font-semibold font-headline flex items-center">
          <ImageUp className="mr-2 h-5 w-5" /> Graph from Image (Experimental)
       </h3>
      <div className="space-y-1">
        <Label htmlFor="image-upload">Upload Graph Image</Label>
        <Input 
          id="image-upload" 
          type="file" 
          accept="image/png, image/jpeg, image/webp"
          onChange={handleImageFileChange}
          className="text-sm"
          suppressHydrationWarning
        />
        {selectedImageFile && <p className="text-xs text-muted-foreground">Selected: {selectedImageFile.name}</p>}
      </div>
      <Button onClick={handleExtractGraph} className="w-full" variant="secondary" disabled={!selectedImageFile || isExtractingGraph} suppressHydrationWarning>
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
          suppressHydrationWarning
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
            suppressHydrationWarning
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
            suppressHydrationWarning
          />
        </div>
      </div>
      <Button onClick={handleGenerateRandomGraph} className="w-full" variant="secondary" suppressHydrationWarning>
        <Shuffle className="mr-2 h-4 w-4" /> Generate Random Graph
      </Button>
    </div>
  );
  
  const handleAlgorithmChange = (value: AlgorithmType) => {
    dispatch({ type: 'SET_ALGORITHM', payload: value });
    // If changing algorithm manually and a specific application graph was loaded,
    // it might be good to clear the startNode if the new algo doesn't need it,
    // or prompt if the current startNode is invalid for the new algo.
    // For simplicity, we let SET_ALGORITHM reset animation state.
    if (value !== 'dijkstra' && state.startNode) {
      // dispatch({ type: 'SET_START_NODE', payload: null }); // Optionally clear start node
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
            // disabled={!!currentApplicationId} // Optionally disable if an app graph is loaded
          >
            <SelectTrigger id="algorithm-select" suppressHydrationWarning>
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
              <SelectTrigger id="start-node" suppressHydrationWarning>
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
          <Button 
            onClick={handleRunAlgorithm} 
            disabled={!selectedAlgorithm || selectedAlgorithm === "none" || (animationSteps.length > 0 && isAnimating)} 
            suppressHydrationWarning
          >
            <Play className="mr-2 h-4 w-4" /> Run
          </Button>
           <Button onClick={handleAnimationToggle} variant="outline" disabled={animationSteps.length === 0} suppressHydrationWarning>
            {isAnimating ? <Pause className="mr-2 h-4 w-4" /> : <StepForward className="mr-2 h-4 w-4" />}
            {isAnimating ? "Pause" : (currentStepIndex < animationSteps.length -1 && currentStepIndex !== -1 ? "Next Step" : "Play Steps")}
          </Button>
        </div>
         <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleResetAnimation} variant="outline" suppressHydrationWarning>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Sim
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" suppressHydrationWarning><Zap className="mr-2 h-4 w-4" /> Clear Graph</Button>
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
                <AlertDialogAction onClick={handleResetGraph} className={buttonVariants({variant: "destructive"})}>Clear Graph</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={!selectedNodeId} suppressHydrationWarning>
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

        {(modeQueryParam === 'image' || modeQueryParam === 'random') && <Separator className="my-4" />}

        {modeQueryParam === 'image' && renderImageGraphSection()}
        {modeQueryParam === 'random' && renderRandomGraphSection()}
        
      </CardContent>
    </Card>
  );
}

    

    


