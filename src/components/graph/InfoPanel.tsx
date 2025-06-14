
"use client";

import React from 'react';
import { useGraph } from '@/providers/GraphProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function InfoPanel() {
  const { state } = useGraph();
  const { messages, animationSteps, currentStepIndex } = state;

  const currentStepMessage = animationSteps[currentStepIndex]?.message;
  const currentStepDescriptionAI = animationSteps[currentStepIndex]?.descriptionForAI;


  return (
    <Card className="w-full h-full shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Algorithm Status</CardTitle>
        {currentStepDescriptionAI && <CardDescription className="text-sm text-muted-foreground pt-1">{currentStepDescriptionAI}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
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
