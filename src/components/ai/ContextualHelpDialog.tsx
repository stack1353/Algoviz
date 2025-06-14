
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useGraph } from "@/providers/GraphProvider";
import { getAlgorithmHelp, type GetAlgorithmHelpInput, type GetAlgorithmHelpOutput } from "@/ai/flows/contextual-algorithm-help";
import { Loader } from "@/components/ui/loader";
import { AlertCircle, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";


export function ContextualHelpDialog() {
  const { state } = useGraph();
  const { selectedAlgorithm, currentVisualizationStateForAI } = state;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<GetAlgorithmHelpOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetHelp = async () => {
    if (!selectedAlgorithm) {
      setError("Please select an algorithm first.");
      return;
    }
    if (!currentVisualizationStateForAI) {
      setError("No current visualization step to get help for. Please run an algorithm.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const input: GetAlgorithmHelpInput = {
        algorithmName: selectedAlgorithm,
        visualizationState: currentVisualizationStateForAI,
      };
      const response = await getAlgorithmHelp(input);
      setAiResponse(response);
    } catch (e) {
      console.error("Error getting AI help:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get help: ${errorMessage}`);
      toast({
        title: "AI Help Error",
        description: `Could not fetch explanation: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setAiResponse(null);
      setError(null);
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Wand2 className="mr-2 h-4 w-4" /> Get AI Explanation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Algorithm Explanation</DialogTitle>
          <DialogDescription>
            Get an AI-powered explanation for the current state of the {selectedAlgorithm || "selected"} algorithm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <Loader />
              <p>Generating explanation...</p>
            </div>
          )}
          {aiResponse && (
            <div className="space-y-2">
              <h3 className="font-semibold">AI Generated Explanation:</h3>
              <Textarea
                value={aiResponse.explanation}
                readOnly
                rows={8}
                className="bg-muted/50"
                aria-label="AI generated explanation"
              />
            </div>
          )}
          {!isLoading && !aiResponse && !error && (
            <p className="text-sm text-muted-foreground">
              Click "Explain Current Step" to get an AI generated explanation.
              Ensure an algorithm is running or a step is highlighted.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleGetHelp} 
            disabled={isLoading || !selectedAlgorithm || !currentVisualizationStateForAI}
          >
            {isLoading ? <Loader size={16} className="mr-2"/> : <Wand2 className="mr-2 h-4 w-4" />}
            Explain Current Step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
