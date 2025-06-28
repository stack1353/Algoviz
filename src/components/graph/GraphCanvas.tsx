
"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGraph } from '@/providers/GraphProvider';
import type { Node, Edge } from '@/types/graph';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ZoomIn, ZoomOut, Trash2 } from 'lucide-react';
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

const NODE_RADIUS = 20;
const SVG_BACKGROUND_COLOR = "hsl(var(--card))";
const NODE_DEFAULT_COLOR = "hsl(var(--primary))";
const NODE_SELECTED_COLOR = "hsl(var(--accent))";
const NODE_TEMP_EDGE_START_COLOR = "hsl(var(--accent))";
const NODE_LABEL_COLOR = "hsl(var(--primary-foreground))";
const EDGE_DEFAULT_COLOR = "hsl(var(--foreground))";
const EDGE_SELECTED_COLOR = "hsl(var(--accent))";
const EDGE_WEIGHT_COLOR = "hsl(var(--secondary-foreground))";
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.2;


export function GraphCanvas() {
  const { state, dispatch } = useGraph();
  const { nodes, edges, selectedNodeId, selectedEdgeId } = state;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tempEdgeStartNode, setTempEdgeStartNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  
  // State for Add Edge Popover
  const [isAddEdgePopoverOpen, setIsAddEdgePopoverOpen] = useState(false);
  const [addEdgeWeight, setAddEdgeWeight] = useState<string>("1");
  const [isDirectedEdge, setIsDirectedEdge] = useState<boolean>(false);
  const [pendingEdgeTargetNode, setPendingEdgeTargetNode] = useState<Node | null>(null);

  // State for Edit Edge Popover
  const [isEditEdgePopoverOpen, setIsEditEdgePopoverOpen] = useState(false);
  const [editEdgeWeight, setEditEdgeWeight] = useState<string>("1");

  const [scale, setScale] = useState(1);

  const getSVGCoordinates = (event: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    let ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null; 

    const svgPoint = pt.matrixTransform(ctm.inverse());

    return { x: svgPoint.x / scale, y: svgPoint.y / scale };
  };


  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.target !== svgRef.current && (event.target as SVGGElement).dataset?.elementType !== 'graph-content') {
        return;
    }
    
    const coords = getSVGCoordinates(event);
    if (coords) {
      dispatch({ type: 'ADD_NODE', payload: { x: coords.x, y: coords.y } });
      setTempEdgeStartNode(null); 
    }
  };

  const handleNodeClick = (node: Node, event: React.MouseEvent<SVGGElement>) => {
    event.stopPropagation(); 

    if (!tempEdgeStartNode) {
      setTempEdgeStartNode(node);
      dispatch({ type: 'SET_SELECTED_NODE', payload: node.id });
    } else if (tempEdgeStartNode.id !== node.id) {
      setPendingEdgeTargetNode(node);
      
      const popoverTrigger = document.getElementById('dynamic-popover-trigger');
      if (popoverTrigger && svgRef.current) {
          let midX_svg = (tempEdgeStartNode.x + node.x) / 2 * scale;
          let midY_svg = (tempEdgeStartNode.y + node.y) / 2 * scale;
          
          const pt = svgRef.current.createSVGPoint();
          pt.x = midX_svg;
          pt.y = midY_svg;
          
          const screenPoint = pt.matrixTransform(svgRef.current.getScreenCTM()!);
          
          popoverTrigger.style.position = 'fixed'; 
          popoverTrigger.style.left = `${screenPoint.x}px`;
          popoverTrigger.style.top = `${screenPoint.y}px`;
      }
      setIsDirectedEdge(state.selectedAlgorithm === 'dijkstra');
      setIsAddEdgePopoverOpen(true);
    } else { 
      setTempEdgeStartNode(null); 
      dispatch({ type: 'SET_SELECTED_NODE', payload: null }); 
    }
  };
  
  const handleConfirmAddEdge = () => {
    if (tempEdgeStartNode && pendingEdgeTargetNode) {
      const weight = parseInt(addEdgeWeight, 10);
      if (isNaN(weight) || weight <=0) {
        toast({ title: "Invalid Weight", description: "Edge weight must be a positive number.", variant: "destructive" });
        return;
      }
      dispatch({ 
        type: 'ADD_EDGE', 
        payload: { 
          source: tempEdgeStartNode.id, 
          target: pendingEdgeTargetNode.id, 
          weight,
          isDirected: isDirectedEdge
        } 
      });
      setTempEdgeStartNode(null);
      setPendingEdgeTargetNode(null);
      setAddEdgeWeight("1");
      setIsDirectedEdge(false);
      setIsAddEdgePopoverOpen(false);
      dispatch({ type: 'SET_SELECTED_NODE', payload: null }); 
    }
  };
  
  const handleEdgeClick = (edge: Edge, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch({ type: 'SET_SELECTED_EDGE', payload: edge.id });
    setEditEdgeWeight(String(edge.weight));

    const sourceNode = getNodeById(edge.source);
    const targetNode = getNodeById(edge.target);
    if (!sourceNode || !targetNode || !svgRef.current) return;
          
    const popoverTrigger = document.getElementById('dynamic-popover-trigger');
    if (popoverTrigger) {
        let midX_svg = (sourceNode.x + targetNode.x) / 2 * scale;
        let midY_svg = (sourceNode.y + targetNode.y) / 2 * scale;
        
        const pt = svgRef.current.createSVGPoint();
        pt.x = midX_svg;
        pt.y = midY_svg;
        
        const screenPoint = pt.matrixTransform(svgRef.current.getScreenCTM()!);
        
        popoverTrigger.style.position = 'fixed'; 
        popoverTrigger.style.left = `${screenPoint.x}px`;
        popoverTrigger.style.top = `${screenPoint.y}px`;
        setIsEditEdgePopoverOpen(true);
    }
  };

  const handleUpdateEdgeWeight = () => {
    if (!selectedEdgeId) return;
    const newWeight = parseInt(editEdgeWeight, 10);
    if (isNaN(newWeight) || newWeight <= 0) {
      toast({ title: "Invalid Weight", description: "Edge weight must be a positive number.", variant: "destructive" });
      return;
    }
    dispatch({ type: 'UPDATE_EDGE_WEIGHT', payload: { edgeId: selectedEdgeId, newWeight } });
    setIsEditEdgePopoverOpen(false);
  };
  
  const handleDeleteEdge = () => {
    if (!selectedEdgeId) return;
    dispatch({ type: 'DELETE_EDGE', payload: { edgeId: selectedEdgeId } });
    setIsEditEdgePopoverOpen(false);
  };


  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (tempEdgeStartNode) {
      const coords = getSVGCoordinates(event); 
      if (coords) setMousePosition(coords);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prevScale => {
      let newScale = prevScale + (direction === 'in' ? ZOOM_STEP : -ZOOM_STEP);
      newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
      return newScale;
    });
  };

  useEffect(() => {
    if (selectedNodeId === null && tempEdgeStartNode) {
      setTempEdgeStartNode(null);
    } else if (selectedNodeId && !nodes.find(n => n.id === selectedNodeId)) {
      dispatch({ type: 'SET_SELECTED_NODE', payload: null });
      setTempEdgeStartNode(null);
    }
  }, [selectedNodeId, tempEdgeStartNode, nodes, dispatch]);


  const getNodeById = useCallback((id: string) => nodes.find(n => n.id === id), [nodes]);
  
  const getSelectedEntityLabel = () => {
      if (selectedNodeId) {
          return nodes.find(n => n.id === selectedNodeId)?.label || selectedNodeId.replace('node-','N');
      }
      if (selectedEdgeId) {
          const edge = edges.find(e => e.id === selectedEdgeId);
          if (!edge) return 'None';
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          const sourceLabel = sourceNode?.label || edge.source.replace('node-','N');
          const targetLabel = targetNode?.label || edge.target.replace('node-','N');
          return `Edge ${sourceLabel}-${targetLabel}`;
      }
      return 'None';
  };

  return (
    <div id="graph-canvas-container" className="w-full h-full bg-card rounded-lg shadow-md overflow-hidden relative">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        style={{ backgroundColor: SVG_BACKGROUND_COLOR }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10" 
            refY="5"
            markerWidth="4" 
            markerHeight="4"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_DEFAULT_COLOR} />
          </marker>
           <marker
            id="arrow-selected"
            viewBox="0 0 10 10"
            refX="10" 
            refY="5"
            markerWidth="4" 
            markerHeight="4"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_SELECTED_COLOR} />
          </marker>
        </defs>
        
        <g transform={`scale(${scale})`} data-element-type="graph-content">
          {edges.map(edge => {
            const sourceNode = getNodeById(edge.source);
            const targetNode = getNodeById(edge.target);
            if (!sourceNode || !targetNode) return null;

            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const isSelected = edge.id === selectedEdgeId;
            const edgeColor = isSelected ? EDGE_SELECTED_COLOR : (edge.color || EDGE_DEFAULT_COLOR);

            const arrowHeadVisualSize = 8;
            const arrowOffset = edge.isDirected ? arrowHeadVisualSize / scale : 0; 
            const nodeRadiusScaled = NODE_RADIUS; 

            const ratioSource = nodeRadiusScaled / dist;
            const ratioTarget = (dist - nodeRadiusScaled - arrowOffset) / dist; 
            
            const sourceX = sourceNode.x + dx * ratioSource;
            const sourceY = sourceNode.y + dy * ratioSource;
            const targetX = sourceNode.x + dx * ratioTarget;
            const targetY = sourceNode.y + dy * ratioTarget;

            return (
              <g key={edge.id} className="cursor-pointer" onClick={(e) => handleEdgeClick(edge, e)}>
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke="transparent"
                  strokeWidth={Math.max(4, 12 / scale)}
                />
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke={edgeColor}
                  strokeWidth={Math.max(0.5, 2 / scale)} 
                  markerEnd={edge.isDirected ? (isSelected ? "url(#arrow-selected)" : "url(#arrow)") : undefined}
                />
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - (5 / scale)}
                  fill={EDGE_WEIGHT_COLOR}
                  fontSize={Math.max(6, 12 / scale)} 
                  textAnchor="middle"
                  pointerEvents="none"
                  dy=".3em" 
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {tempEdgeStartNode && mousePosition && (
            <line
              x1={tempEdgeStartNode.x}
              y1={tempEdgeStartNode.y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke={EDGE_DEFAULT_COLOR}
              strokeWidth={Math.max(0.5, 2 / scale)}
              strokeDasharray={`${Math.max(1, 5/scale)},${Math.max(1, 5/scale)}`} 
            />
          )}

          {nodes.map(node => (
            <g key={node.id} onClick={(e) => handleNodeClick(node, e)} className="cursor-pointer" data-element-type="node">
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS} 
                fill={node.color || (selectedNodeId === node.id ? NODE_SELECTED_COLOR : (tempEdgeStartNode?.id === node.id ? NODE_TEMP_EDGE_START_COLOR : NODE_DEFAULT_COLOR))}
                stroke="hsl(var(--border))"
                strokeWidth={Math.max(0.5, 1 / scale)} 
              />
              <text
                x={node.x}
                y={node.y} 
                textAnchor="middle"
                fill={NODE_LABEL_COLOR}
                fontSize={Math.max(6, 12 / scale)} 
                fontWeight="bold"
                pointerEvents="none" 
                dy=".3em" 
              >
                {node.label || node.id.replace('node-', 'N')}
              </text>
            </g>
          ))}
        </g>
      </svg>
      
      {/* Popover for Add/Edit Edge */}
      <Popover open={isAddEdgePopoverOpen || isEditEdgePopoverOpen} onOpenChange={(isOpen) => {
        if (!isOpen) { 
          setIsAddEdgePopoverOpen(false);
          setIsEditEdgePopoverOpen(false);
          setTempEdgeStartNode(null);
          setPendingEdgeTargetNode(null);
          dispatch({ type: 'SET_SELECTED_NODE', payload: null });
          dispatch({ type: 'SET_SELECTED_EDGE', payload: null });
        }
      }}>
        <PopoverTrigger asChild>
          <button id="dynamic-popover-trigger" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width:1, height:1 }} />
        </PopoverTrigger>
        <PopoverContent className="w-60">
          { isAddEdgePopoverOpen &&
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add Edge</h4>
                {tempEdgeStartNode && pendingEdgeTargetNode && (
                  <p className="text-sm text-muted-foreground">
                    From: {tempEdgeStartNode.label || tempEdgeStartNode.id.replace('node-','N')} To: {pendingEdgeTargetNode.label || pendingEdgeTargetNode.id.replace('node-','N')}.
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight" type="number" value={addEdgeWeight}
                  onChange={(e) => setAddEdgeWeight(e.target.value)}
                  className="col-span-2 h-8" min="1" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleConfirmAddEdge(); }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isDirected" checked={isDirectedEdge} onCheckedChange={(checked) => setIsDirectedEdge(checked as boolean)} />
                <Label htmlFor="isDirected" className="text-sm font-medium">Directed Edge</Label>
              </div>
              <Button onClick={handleConfirmAddEdge} size="sm">Add Edge</Button>
            </div>
          }
          { isEditEdgePopoverOpen &&
            <div className="grid gap-4">
               <div className="space-y-2">
                <h4 className="font-medium leading-none">Edit Edge</h4>
                <p className="text-sm text-muted-foreground">Update weight or delete this edge.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-weight">Weight</Label>
                <Input
                  id="edit-weight" type="number" value={editEdgeWeight}
                  onChange={(e) => setEditEdgeWeight(e.target.value)}
                  className="col-span-2 h-8" min="1" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleUpdateEdgeWeight(); }}
                />
              </div>
              <div className="flex justify-between gap-2">
                <Button onClick={handleUpdateEdgeWeight} size="sm" className="flex-1">Update</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" title="Delete Edge"><Trash2 className="h-4 w-4"/></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete the selected edge. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteEdge} className={buttonVariants({variant: 'destructive'})}>Delete Edge</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          }
        </PopoverContent>
      </Popover>

      <div className="absolute top-2 right-2 flex flex-col space-y-1">
        <Button variant="outline" size="icon" onClick={() => handleZoom('in')} disabled={scale >= MAX_ZOOM} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleZoom('out')} disabled={scale <= MIN_ZOOM} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-2 left-2 p-2 bg-card/80 rounded border border-border text-xs text-muted-foreground">
        Click to add node. Click two nodes to add an edge. Click an edge to edit. Selected: {getSelectedEntityLabel()}
      </div>
    </div>
  );
}
