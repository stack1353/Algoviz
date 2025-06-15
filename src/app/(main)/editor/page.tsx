"use client";

import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { AlgorithmControls } from "@/components/graph/AlgorithmControls";
import { InfoPanel } from "@/components/graph/InfoPanel";

export default function EditorPage() {
  return (
    <div className="container mx-auto p-4 flex-1 flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      <div className="lg:w-2/3 h-full min-h-[400px] lg:min-h-0">
        <GraphCanvas />
      </div>
      <div className="lg:w-1/3 flex flex-col gap-4 h-full">
        <div className="flex-shrink-0">
         <AlgorithmControls />
        </div>
        <div className="flex-grow min-h-[200px]">
         <InfoPanel />
        </div>
      </div>
    </div>
  );
}
