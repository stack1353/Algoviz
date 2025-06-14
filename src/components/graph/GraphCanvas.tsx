
"use client";

import React, { useRef, useState, useCallback } from 'react';
import { useGraph } from '@/providers/GraphProvider';
import type { Node, Edge } from '@/types/graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const NODE_RADIUS = 20;
const SVG_BACKGROUND_COLOR = "hsl(var(--card))"; 
const NODE_DEFAULT_COLOR = "hsl(var(--primary))";
const NODE_LABEL_COLOR = "hsl(var(--primary-foreground))";
const EDGE_DEFAULT_COLOR = "hsl(var(--foreground))";
const EDGE_WEIGHT_COLOR = "hsl(var(--secondary-foreground))";


export function GraphCanvas() {
  const { state, dispatch } = useGraph();
  const { nodes, edges } = state;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tempEdgeStartNode, setTempEdgeStartNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [edgeWeight, setEdgeWeight] = useState<string>("1");
  const [isWeightPopoverOpen, setIsWeightPopoverOpen] = useState(false);
  const [pendingEdgeTargetNode, setPendingEdgeTargetNode] = useState<Node | null>(null);

  const getSVGCoordinates = (event: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.target !== svgRef.current) return; // Click was on a node or edge, not canvas
    
    const coords = getSVGCoordinates(event);
    if (coords) {
      dispatch({ type: 'ADD_NODE', payload: { x: coords.x, y: coords.y } });
      setTempEdgeStartNode(null); // Cancel any pending edge
    }
  };

  const handleNodeClick = (node: Node) => {
    if (!tempEdgeStartNode) {
      setTempEdgeStartNode(node);
    } else if (tempEdgeStartNode.id !== node.id) {
      setPendingEdgeTargetNode(node);
      setIsWeightPopoverOpen(true); // Open popover to ask for weight
    } else { // Clicked same node again
      setTempEdgeStartNode(null); // Cancel edge drawing
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
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (tempEdgeStartNode) {
      const coords = getSVGCoordinates(event);
      if (coords) setMousePosition(coords);
    }
  };

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

        {edges.map(edge => {
          const sourceNode = getNodeById(edge.source);
          const targetNode = getNodeById(edge.target);
          if (!sourceNode || !targetNode) return null;

          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate shortened line for arrow
          const ratio = (dist - NODE_RADIUS - (edge.isDirected ? 2 : 0)) / dist; 
          const targetX = sourceNode.x + dx * ratio;
          const targetY = sourceNode.y + dy * ratio;
          const sourceRatio = NODE_RADIUS / dist;
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
                strokeWidth="2.5"
                markerEnd={edge.isDirected ? "url(#arrow)" : undefined}
              />
              <text
                x={(sourceNode.x + targetNode.x) / 2}
                y={(sourceNode.y + targetNode.y) / 2 - 5}
                fill={EDGE_WEIGHT_COLOR}
                fontSize="12"
                textAnchor="middle"
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
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {nodes.map(node => (
          <g key={node.id} onClick={() => handleNodeClick(node)} className="cursor-pointer">
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS}
              fill={node.color || (tempEdgeStartNode?.id === node.id ? "hsl(var(--accent))" : NODE_DEFAULT_COLOR)}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
            <text
              x={node.x}
              y={node.y + 5} // Adjust for better vertical centering
              textAnchor="middle"
              fill={NODE_LABEL_COLOR}
              fontSize="12"
              fontWeight="bold"
              pointerEvents="none" 
            >
              {node.label || node.id.replace('node-', 'N')}
            </text>
          </g>
        ))}
      </svg>
      {pendingEdgeTargetNode && tempEdgeStartNode && (
         <Popover open={isWeightPopoverOpen} onOpenChange={setIsWeightPopoverOpen}>
            <PopoverTrigger asChild>
              {/* Invisible trigger, popover is controlled by state */}
              <button style={{ position: 'absolute', left: (tempEdgeStartNode.x + pendingEdgeTargetNode.x)/2, top: (tempEdgeStartNode.y + pendingEdgeTargetNode.y)/2 }} />
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Edge Weight</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter weight for edge {tempEdgeStartNode.id.replace('node-','N')} - {pendingEdgeTargetNode.id.replace('node-','N')}.
                  </p>
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
                  />
                </div>
                <Button onClick={handleConfirmEdge} size="sm">Add Edge</Button>
              </div>
            </PopoverContent>
          </Popover>
      )}
      <div className="absolute bottom-2 left-2 p-2 bg-card/80 rounded border border-border text-xs text-muted-foreground">
        Click to add node. Click two nodes to add an edge.
      </div>
    </div>
  );
}
