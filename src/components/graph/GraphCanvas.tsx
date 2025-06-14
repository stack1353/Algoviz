
"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGraph } from '@/providers/GraphProvider';
import type { Node } from '@/types/graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ZoomIn, ZoomOut, MinusCircle } from 'lucide-react';

const NODE_RADIUS = 20;
const SVG_BACKGROUND_COLOR = "hsl(var(--card))"; 
const NODE_DEFAULT_COLOR = "hsl(var(--primary))";
const NODE_SELECTED_COLOR = "hsl(var(--accent))";
const NODE_TEMP_EDGE_START_COLOR = "hsl(var(--accent))";
const NODE_LABEL_COLOR = "hsl(var(--primary-foreground))";
const EDGE_DEFAULT_COLOR = "hsl(var(--foreground))";
const EDGE_WEIGHT_COLOR = "hsl(var(--secondary-foreground))";
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.2;


export function GraphCanvas() {
  const { state, dispatch } = useGraph();
  const { nodes, edges, selectedNodeId } = state;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tempEdgeStartNode, setTempEdgeStartNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [edgeWeight, setEdgeWeight] = useState<string>("1");
  const [isWeightPopoverOpen, setIsWeightPopoverOpen] = useState(false);
  const [pendingEdgeTargetNode, setPendingEdgeTargetNode] = useState<Node | null>(null);
  const [scale, setScale] = useState(1);
  // For panning - future enhancement
  // const [translate, setTranslate] = useState({ x: 0, y: 0 }); 

  const getSVGCoordinates = (event: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    // Adjust for current scale
    return { x: svgPoint.x / scale, y: svgPoint.y / scale };
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.target !== svgRef.current && (event.target as SVGElement)?.closest('g[data-element-type="graph-content"]') !== null) {
        // if click is on the <g> wrapper, but not nodes/edges directly
         if (event.target === event.currentTarget.querySelector('g[data-element-type="graph-content"]')) {
            // fall through to add node
         } else {
            // Click was on a node or edge or other element inside the scaled group
            return;
         }
    }
    
    const coords = getSVGCoordinates(event);
    if (coords) {
      dispatch({ type: 'ADD_NODE', payload: { x: coords.x, y: coords.y } });
      setTempEdgeStartNode(null); 
      // ADD_NODE action now selects the new node, so no need to dispatch SET_SELECTED_NODE(null) here
    }
  };

  const handleNodeClick = (node: Node, event: React.MouseEvent<SVGGElement>) => {
    event.stopPropagation(); // Prevent canvas click from firing

    if (!tempEdgeStartNode) {
      setTempEdgeStartNode(node);
      dispatch({ type: 'SET_SELECTED_NODE', payload: node.id });
    } else if (tempEdgeStartNode.id !== node.id) {
      setPendingEdgeTargetNode(node);
      // Position popover near the midpoint of the potential edge
      const x = (tempEdgeStartNode.x + node.x) / 2 * scale;
      const y = (tempEdgeStartNode.y + node.y) / 2 * scale;
      // This logic for popover positioning might need refinement with scaled SVG
      const popoverTrigger = document.getElementById('edge-weight-popover-trigger');
      if (popoverTrigger) {
          popoverTrigger.style.left = `${x}px`;
          popoverTrigger.style.top = `${y}px`;
      }
      setIsWeightPopoverOpen(true);
    } else { // Clicked same node again
      setTempEdgeStartNode(null); // Cancel edge drawing
      dispatch({ type: 'SET_SELECTED_NODE', payload: null }); // Deselect
    }
  };
  
  const handleConfirmEdge = () => {
    if (tempEdgeStartNode && pendingEdgeTargetNode) {
      const weight = parseInt(edgeWeight, 10);
      if (isNaN(weight) || weight <=0) {
        toast({ title: "Invalid Weight", description: "Edge weight must be a positive number.", variant: "destructive" });
        return;
      }
      dispatch({ type: 'ADD_EDGE', payload: { source: tempEdgeStartNode.id, target: pendingEdgeTargetNode.id, weight } });
      setTempEdgeStartNode(null);
      setPendingEdgeTargetNode(null);
      setEdgeWeight("1");
      setIsWeightPopoverOpen(false);
      dispatch({ type: 'SET_SELECTED_NODE', payload: null }); // Deselect after adding edge
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (tempEdgeStartNode) {
      const coords = getSVGCoordinates(event); // Already adjusted for scale
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
    // If selected node is deleted from AlgorithmControls, tempEdgeStartNode might be stale
    if (selectedNodeId === null && tempEdgeStartNode) {
      setTempEdgeStartNode(null);
    } else if (selectedNodeId && !nodes.find(n => n.id === selectedNodeId)) {
      // Selected node was deleted externally
      dispatch({ type: 'SET_SELECTED_NODE', payload: null });
      setTempEdgeStartNode(null);
    }
  }, [selectedNodeId, tempEdgeStartNode, nodes, dispatch]);


  const getNodeById = useCallback((id: string) => nodes.find(n => n.id === id), [nodes]);

  return (
    <div className="w-full h-full bg-card rounded-lg shadow-md overflow-hidden relative">
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
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_DEFAULT_COLOR} />
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
            
            const arrowOffset = edge.isDirected ? 6 / scale : 0; // Adjust arrow offset based on scale for consistent appearance
            const nodeRadiusScaled = NODE_RADIUS; 

            const ratio = (dist - nodeRadiusScaled - arrowOffset) / dist; 
            const targetX = sourceNode.x + dx * ratio;
            const targetY = sourceNode.y + dy * ratio;
            
            const sourceRatio = nodeRadiusScaled / dist;
            const sourceX = sourceNode.x + dx * sourceRatio;
            const sourceY = sourceNode.y + dy * sourceRatio;

            return (
              <g key={edge.id}>
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke={edge.color || EDGE_DEFAULT_COLOR}
                  strokeWidth={2 / scale} // Make stroke thinner as you zoom in
                  markerEnd={edge.isDirected ? "url(#arrow)" : undefined}
                />
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - (5 / scale)}
                  fill={EDGE_WEIGHT_COLOR}
                  fontSize={12 / scale} // Adjust font size with zoom
                  textAnchor="middle"
                  pointerEvents="none"
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
              strokeWidth={2 / scale}
              strokeDasharray={`${5/scale},${5/scale}`}
            />
          )}

          {nodes.map(node => (
            <g key={node.id} onClick={(e) => handleNodeClick(node, e)} className="cursor-pointer">
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                fill={node.color || (selectedNodeId === node.id ? NODE_SELECTED_COLOR : (tempEdgeStartNode?.id === node.id ? NODE_TEMP_EDGE_START_COLOR : NODE_DEFAULT_COLOR))}
                stroke="hsl(var(--border))"
                strokeWidth={1 / scale}
              />
              <text
                x={node.x}
                y={node.y + (5 / scale)} 
                textAnchor="middle"
                fill={NODE_LABEL_COLOR}
                fontSize={12 / scale} 
                fontWeight="bold"
                pointerEvents="none" 
              >
                {node.label || node.id.replace('node-', 'N')}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Invisible Popover Trigger - position updated dynamically */}
      <Popover open={isWeightPopoverOpen} onOpenChange={(isOpen) => {
          setIsWeightPopoverOpen(isOpen);
          if (!isOpen) { // If popover closed without confirming
            setTempEdgeStartNode(null);
            setPendingEdgeTargetNode(null);
            dispatch({ type: 'SET_SELECTED_NODE', payload: null });
          }
        }}
      >
        <PopoverTrigger asChild>
          <button id="edge-weight-popover-trigger" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Edge Weight</h4>
              {tempEdgeStartNode && pendingEdgeTargetNode && (
                <p className="text-sm text-muted-foreground">
                  Enter weight for edge {tempEdgeStartNode.label || tempEdgeStartNode.id.replace('node-','N')} - {pendingEdgeTargetNode.label || pendingEdgeTargetNode.id.replace('node-','N')}.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                className="col-span-2 h-8"
                min="1"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmEdge(); }}
              />
            </div>
            <Button onClick={handleConfirmEdge} size="sm">Add Edge</Button>
          </div>
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
        Click to add node. Click two nodes to add an edge. Selected: {selectedNodeId ? (nodes.find(n=>n.id === selectedNodeId)?.label || selectedNodeId) : 'None'}
      </div>
    </div>
  );
}
