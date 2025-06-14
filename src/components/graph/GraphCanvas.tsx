
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
    
    // Get the CTM (Current Transformation Matrix) of the SVG element itself
    let ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null; // Should not happen in normal circumstances

    // If a scaled group (<g transform="scale(...)">) is the direct child,
    // we need to account for its transformation if we want coordinates relative to that group's parent (the SVG).
    // However, for adding nodes, we want coordinates *within* the scaled group if it exists,
    // or within the SVG if it doesn't.
    // The current setup applies scale to a <g> element. We want coordinates *as if* there was no scale on the <g>,
    // but the click event is on the SVG.
    
    // The pt.matrixTransform(ctm.inverse()) gives coordinates relative to the SVG viewport.
    // If we have a <g transform="scale(S)"> inside, and we want to place a node at (x',y') *within* that g,
    // such that its visual position matches the click, then x' = svg_click_x / S, y' = svg_click_y / S.

    const svgPoint = pt.matrixTransform(ctm.inverse());

    // If we are transforming a <g> element inside the SVG by `scale`:
    // The coordinates from svgPoint are in the SVG's coordinate system.
    // To get coordinates for elements *inside* the scaled <g>, we divide by scale.
    return { x: svgPoint.x / scale, y: svgPoint.y / scale };
  };


  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
     // Check if the click target is the SVG itself or the main <g> element (for background clicks)
    if (event.target !== svgRef.current && (event.target as SVGGElement).dataset?.elementType !== 'graph-content') {
        // Click was on a node, edge, or other element, not the canvas background
        return;
    }
    
    const coords = getSVGCoordinates(event);
    if (coords) {
      dispatch({ type: 'ADD_NODE', payload: { x: coords.x, y: coords.y } });
      setTempEdgeStartNode(null); 
      // ADD_NODE action now selects the new node.
      // If we wanted to deselect on canvas click, we'd dispatch SET_SELECTED_NODE(null) here.
      // For now, clicking canvas adds a node and selects it.
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
      
      const popoverTrigger = document.getElementById('edge-weight-popover-trigger');
      if (popoverTrigger && svgRef.current) {
          // We need to translate the logical SVG coordinates to screen coordinates for the popover
          const svgRect = svgRef.current.getBoundingClientRect();

          // Midpoint in SVG's scaled coordinate system
          let midX_svg = (tempEdgeStartNode.x + node.x) / 2;
          let midY_svg = (tempEdgeStartNode.y + node.y) / 2;
          
          // Apply scale to get "visual" coordinates within the unscaled SVG viewport space
          midX_svg *= scale;
          midY_svg *= scale;

          // Create an SVGPoint for transformation
          const pt = svgRef.current.createSVGPoint();
          pt.x = midX_svg;
          pt.y = midY_svg;
          
          // Transform this point to screen coordinates
          const screenPoint = pt.matrixTransform(svgRef.current.getScreenCTM()!);
          
          popoverTrigger.style.position = 'fixed'; // Ensure it's relative to viewport
          popoverTrigger.style.left = `${screenPoint.x}px`;
          popoverTrigger.style.top = `${screenPoint.y}px`;
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
            markerWidth="4" // Keeps arrow size consistent regardless of zoom
            markerHeight="4"
            orient="auto-start-reverse"
            markerUnits="strokeWidth" // Make marker scale with stroke if desired, or userSpaceOnUse for fixed
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_DEFAULT_COLOR} />
          </marker>
        </defs>
        
        {/* This 'g' element will handle the zooming and panning */}
        <g transform={`scale(${scale})`} data-element-type="graph-content">
          {edges.map(edge => {
            const sourceNode = getNodeById(edge.source);
            const targetNode = getNodeById(edge.target);
            if (!sourceNode || !targetNode) return null;

            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Adjust arrow offset to be visually consistent at different zoom levels
            const arrowHeadSize = 8; // Fixed visual size for arrowhead logic
            const arrowOffset = edge.isDirected ? arrowHeadSize / scale : 0; 
            const nodeRadiusScaled = NODE_RADIUS; // Node radius is in unscaled coordinates

            // Calculate new start and end points for the line to avoid overlapping the node circle
            // And to make space for the arrowhead
            const ratioSource = nodeRadiusScaled / dist;
            const ratioTarget = (dist - nodeRadiusScaled - arrowOffset) / dist; 
            
            const sourceX = sourceNode.x + dx * ratioSource;
            const sourceY = sourceNode.y + dy * ratioSource;
            const targetX = sourceNode.x + dx * ratioTarget;
            const targetY = sourceNode.y + dy * ratioTarget;

            return (
              <g key={edge.id}>
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke={edge.color || EDGE_DEFAULT_COLOR}
                  strokeWidth={Math.max(0.5, 2 / scale)} // Ensure stroke doesn't become too thin or disappear
                  markerEnd={edge.isDirected ? "url(#arrow)" : undefined}
                />
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - (5 / scale)}
                  fill={EDGE_WEIGHT_COLOR}
                  fontSize={Math.max(6, 12 / scale)} // Ensure font size is readable
                  textAnchor="middle"
                  pointerEvents="none"
                  dy=".3em" // Better vertical alignment
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
              strokeDasharray={`${Math.max(1, 5/scale)},${Math.max(1, 5/scale)}`} // Ensure dash is visible
            />
          )}

          {nodes.map(node => (
            <g key={node.id} onClick={(e) => handleNodeClick(node, e)} className="cursor-pointer" data-element-type="node">
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS} // Radius is in unscaled coordinates
                fill={node.color || (selectedNodeId === node.id ? NODE_SELECTED_COLOR : (tempEdgeStartNode?.id === node.id ? NODE_TEMP_EDGE_START_COLOR : NODE_DEFAULT_COLOR))}
                stroke="hsl(var(--border))"
                strokeWidth={Math.max(0.5, 1 / scale)} // Adjust stroke width with zoom
              />
              <text
                x={node.x}
                y={node.y} 
                textAnchor="middle"
                fill={NODE_LABEL_COLOR}
                fontSize={Math.max(6, 12 / scale)} 
                fontWeight="bold"
                pointerEvents="none" 
                dy=".3em" // Better vertical centering of text
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
          {/* This button is positioned dynamically using JavaScript */}
          <button id="edge-weight-popover-trigger" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width:1, height:1 }} />
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
        Click to add node. Click two nodes to add an edge. Selected: {selectedNodeId ? (nodes.find(n=>n.id === selectedNodeId)?.label || selectedNodeId.replace('node-','N')) : 'None'}
      </div>
    </div>
  );
}
