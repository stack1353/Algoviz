
"use client";

import React from 'react';
import { useGraph } from '@/providers/GraphProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InfoPanel() {
  const { state } = useGraph();
  const { messages, animationSteps, currentStepIndex, distanceMatrix } = state;

  const currentStepMessage = animationSteps[currentStepIndex]?.message;
  const currentStepDescriptionAI = animationSteps[currentStepIndex]?.descriptionForAI;


  return (
    <Card className="w-full h-full shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Algorithm Status</CardTitle>
        {currentStepDescriptionAI && <CardDescription className="text-sm text-muted-foreground pt-1">{currentStepDescriptionAI}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        {distanceMatrix && (
            <div className="flex-shrink-0 border-b pb-2 mb-2">
                <h3 className="text-sm font-semibold mb-1 px-1">Distance Matrix</h3>
                <ScrollArea className="w-full h-auto max-h-48">
                    <Table className="text-xs">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 font-bold text-muted-foreground">From/To</TableHead>
                                {distanceMatrix.nodeLabels.map(label => <TableHead key={label} className="text-center font-bold">{label}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {distanceMatrix.data.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-muted-foreground">{distanceMatrix.nodeLabels[i]}</TableCell>
                                    {row.map((val, j) => (
                                        <TableCell key={j} className="text-center font-mono">
                                            {String(val)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        )}
        <ScrollArea className="flex-grow min-h-0 pr-4 mt-2">
          {messages.length === 0 && !currentStepMessage && <p className="text-sm text-muted-foreground">Run an algorithm to see its steps here.</p>}
          {currentStepMessage && (
            <div className="mb-2 p-2 bg-accent/10 border border-accent/30 rounded-md">
              <p className="text-sm font-semibold text-accent-foreground">Current Step:</p>
              <p className="text-sm text-accent-foreground">{currentStepMessage}</p>
            </div>
          )}
          {messages.slice().reverse().map((msg, index) => (
            <div key={index} className="mb-1 text-xs text-foreground/80 p-1 border-b border-border/50">
              {msg}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
