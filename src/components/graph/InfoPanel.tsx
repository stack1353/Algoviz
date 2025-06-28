
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
    
    if (!graphCanvasElement) {
        toast({
            title: "Download Error",
            description: "Could not find the graph canvas element to generate the PDF.",
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
        let yPos = margin;

        // --- Add Title ---
        doc.setFontSize(22);
        doc.text("AlgoViz Algorithm Report", pageWidth / 2, yPos + 5, { align: 'center' });
        yPos += 10;
        doc.setFontSize(14);
        doc.text(`Algorithm: ${selectedAlgorithm || 'N/A'}`, pageWidth / 2, yPos + 5, { align: 'center' });
        yPos += 15;
        
        // --- Capture Graph Canvas ---
        try {
            const graphCanvas = await html2canvas(graphCanvasElement, {
                 backgroundColor: 'hsl(var(--card))',
                 useCORS: true, 
                 scale: 2
            });
            const graphImgData = graphCanvas.toDataURL('image/png');
            const graphImgProps = doc.getImageProperties(graphImgData);
            const graphAspectRatio = graphImgProps.width / graphImgProps.height;
            let graphImgWidth = pageWidth - margin * 2;
            let graphImgHeight = graphImgWidth / graphAspectRatio;

            if (yPos + graphImgHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            
            doc.addImage(graphImgData, 'PNG', margin, yPos, graphImgWidth, graphImgHeight);
            yPos += graphImgHeight + 10;
        } catch (canvasError) {
             console.error("Failed to capture graph canvas:", canvasError);
             toast({
                title: "Canvas Capture Failed",
                description: "Could not generate an image of the graph. The report will be generated without it.",
                variant: "destructive"
             });
             doc.text("Error: Graph visualization could not be captured.", margin, yPos);
             yPos += 10;
        }
        
        // --- Add Info Panel Content manually ---
        if (yPos > pageHeight - margin - 20) { // Check for space for header
            doc.addPage();
            yPos = margin;
        }
        
        doc.setFontSize(16);
        doc.text("Algorithm Steps & Explanation", margin, yPos);
        yPos += 8;

        doc.setDrawColor(200); // light gray line
        doc.line(margin, yPos, pageWidth - margin, yPos); // separator line
        yPos += 8;

        const allMessages = currentStepMessage ? [`Current Step: ${currentStepMessage}`, ...messages.slice().reverse()] : [...messages.slice().reverse()];

        if (allMessages.length === 0) {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text("No algorithm steps were recorded.", margin, yPos);
        } else {
            doc.setFontSize(10);
            doc.setTextColor(40); // Dark gray text
            
            const textLines = doc.splitTextToSize(allMessages.map(m => `- ${m}`).join('\n'), pageWidth - margin * 2);

            for(const line of textLines) {
                 if (yPos > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                 }
                 doc.text(line, margin, yPos);
                 yPos += 6; // Line height
            }
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
        <div id="info-panel-content" className='p-1 h-full'>
            {messages.length === 0 && !currentStepMessage && <p className="text-sm text-muted-foreground">Run an algorithm to see its steps here.</p>}
            {currentStepMessage && (
                <div className="mb-2 p-2 bg-primary/10 border border-primary/30 rounded-md">
                <p className="text-sm font-semibold text-primary-foreground/90">Current Step:</p>
                <p className="text-sm text-primary-foreground/90">{currentStepMessage}</p>
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
