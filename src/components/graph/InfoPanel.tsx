
"use client";

import React, { useState } from 'react';
import { useGraph } from '@/providers/GraphProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';
import { Loader } from '../ui/loader';

export function InfoPanel() {
  const { state } = useGraph();
  const { messages, animationSteps, currentStepIndex, selectedAlgorithm } = state;
  const [isDownloading, setIsDownloading] = useState(false);

  const currentStepMessage = animationSteps[currentStepIndex]?.message;
  const currentStepDescriptionAI = animationSteps[currentStepIndex]?.descriptionForAI;
  
  const handleDownloadPdf = async () => {
    const graphCanvasElement = document.getElementById('graph-canvas-container');
    const infoPanelContentElement = document.getElementById('info-panel-content');
    
    if (!graphCanvasElement || !infoPanelContentElement) {
        toast({
            title: "Download Error",
            description: "Could not find the necessary elements to generate the PDF.",
            variant: "destructive"
        });
        return;
    }
    
    setIsDownloading(true);
    toast({ title: "Generating PDF...", description: "Please wait while the report is being created." });

    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        
        // --- Add Title ---
        doc.setFontSize(22);
        doc.text("AlgoViz Algorithm Report", pageWidth / 2, margin + 5, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`Algorithm: ${selectedAlgorithm || 'N/A'}`, pageWidth / 2, margin + 15, { align: 'center' });
        
        // --- Capture Graph Canvas ---
        const graphCanvas = await html2canvas(graphCanvasElement, {
             backgroundColor: 'hsl(var(--card))',
             scale: 2
        });
        const graphImgData = graphCanvas.toDataURL('image/png');
        const graphImgProps = doc.getImageProperties(graphImgData);
        const graphAspectRatio = graphImgProps.width / graphImgProps.height;
        let graphImgWidth = pageWidth - margin * 2;
        let graphImgHeight = graphImgWidth / graphAspectRatio;
        
        doc.addImage(graphImgData, 'PNG', margin, margin + 25, graphImgWidth, graphImgHeight);
        
        // --- Capture Info Panel Content ---
        const infoCanvas = await html2canvas(infoPanelContentElement, {
             backgroundColor: 'hsl(var(--card))',
             scale: 2,
        });
        const infoImgData = infoCanvas.toDataURL('image/png');
        const infoImgProps = doc.getImageProperties(infoImgData);
        const infoAspectRatio = infoImgProps.width / infoImgProps.height;
        let infoImgWidth = pageWidth - margin * 2;
        let infoImgHeight = infoImgWidth / infoAspectRatio;

        // Check if there is space on the current page
        const spaceLeft = pageHeight - (margin + 25 + graphImgHeight + 10);
        if (infoImgHeight > spaceLeft) {
            doc.addPage();
            doc.addImage(infoImgData, 'PNG', margin, margin, infoImgWidth, infoImgHeight);
        } else {
            doc.addImage(infoImgData, 'PNG', margin, margin + 25 + graphImgHeight + 5, infoImgWidth, infoImgHeight);
        }
        
        doc.save(`algoviz-${selectedAlgorithm}-report.pdf`);
        toast({ title: "Download Complete", description: "Your PDF report has been saved." });

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({
            title: "PDF Generation Failed",
            description: "An unexpected error occurred while creating the PDF.",
            variant: "destructive"
        });
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full h-full shadow-lg flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1">
            <CardTitle className="text-xl font-headline">Algorithm Status</CardTitle>
            {currentStepDescriptionAI && <CardDescription className="text-sm text-muted-foreground pt-1">{currentStepDescriptionAI}</CardDescription>}
        </div>
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPdf}
            disabled={isDownloading || animationSteps.length === 0}
            title="Download report as PDF"
        >
          {isDownloading ? <Loader size={16} className="mr-2" /> : <Download className="mr-2 h-4 w-4" />}
          PDF
        </Button>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <div id="info-panel-content" className='p-1'>
            {messages.length === 0 && !currentStepMessage && <p className="text-sm text-muted-foreground">Run an algorithm to see its steps here.</p>}
            {currentStepMessage && (
                <div className="mb-2 p-2 bg-accent/10 border border-accent/30 rounded-md">
                <p className="text-sm font-semibold text-accent-foreground">Current Step:</p>
                <p className="text-sm text-accent-foreground">{currentStepMessage}</p>
                </div>
            )}
            <ScrollArea className="h-full max-h-[calc(100%-40px)] pr-4 mt-2">
                {messages.slice().reverse().map((msg, index) => (
                    <div key={index} className="mb-1 text-xs text-foreground/80 p-1 border-b border-border/50">
                    {msg}
                    </div>
                ))}
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
