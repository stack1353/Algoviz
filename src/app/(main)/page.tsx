
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // Simplified to just Card
import { Palette, Shuffle, ImageUp, ArrowRight } from 'lucide-react';
import type React from 'react';

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  link: string;
  linkText: string;
  imageUrl: string;
  imageAlt: string;
  aiHint: string;
}

const features: Feature[] = [
  {
    icon: <Palette className="w-7 h-7 text-primary" />,
    title: "Interactive Canvas",
    description: "Draw your own graphs directly on the canvas. Add nodes, connect them with weighted edges, and see algorithms run on your creations.",
    link: "/editor?mode=draw",
    linkText: "Start Drawing",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Abstract representation of a graph being drawn",
    aiHint: "canvas digital"
  },
  {
    icon: <ImageUp className="w-7 h-7 text-primary" />,
    title: "Graph from Image (AI)",
    description: "Upload an image of a graph, and our AI will attempt to extract its structure, allowing you to visualize algorithms on it.",
    link: "/editor?mode=image",
    linkText: "Upload an Image",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "An image being processed by AI to extract a graph",
    aiHint: "ai vision"
  },
  {
    icon: <Shuffle className="w-7 h-7 text-primary" />,
    title: "Random Graph Generation",
    description: "Instantly generate random graphs with a specified number of nodes and edge weight ranges to test algorithms on diverse structures.",
    link: "/editor?mode=random",
    linkText: "Generate a Graph",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "A complex, randomly generated graph structure",
    aiHint: "abstract network"
  }
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-4 md:p-8 relative overflow-hidden">
      {/* Potential background image (currently commented out)
      <Image
        src="/my-custom-background.png" 
        alt="Abstract network background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-20"
        priority
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/70 via-background/90 to-background"></div>
      */}

      <div className="relative z-20">
        <main className="container mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
            Unlock Graph Algorithms with <span className="text-primary">AlgoViz</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactively learn, visualize, and understand complex graph algorithms like Dijkstra's, Prim's, and Kruskal's. Create graphs, see step-by-step execution, and explore real-world uses.
          </p>

          <section className="mt-12 md:mt-20 w-full">
            <div className="flex flex-col items-center space-y-8">
              {features.map((feature) => (
                <Link 
                  href={feature.link} 
                  key={feature.title} 
                  className="block w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-xl hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 outline-none transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
                  aria-label={`Learn more about ${feature.title}`}
                >
                  <Card className="h-full flex flex-col bg-card group border-2 border-transparent hover:border-primary/40 transition-colors duration-300">
                    <div className="relative w-full h-56 overflow-hidden">
                      <Image
                        src={feature.imageUrl}
                        alt={feature.imageAlt}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={feature.aiHint}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow text-left">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0 border border-primary/20">
                           {feature.icon}
                         </div>
                         <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm mb-6 flex-grow">{feature.description}</p>
                      <Button 
                        asChild // The Link component handles navigation
                        variant="default" 
                        size="lg" 
                        className="w-full mt-auto bg-primary hover:bg-primary/80 text-primary-foreground transition-all duration-300 group-hover:brightness-110 group-hover:shadow-md"
                      >
                        <a> 
                          {feature.linkText}
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
