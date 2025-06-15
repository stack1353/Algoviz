
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftingCompass, ImageUp, Shuffle, ArrowRight } from "lucide-react";

const features = [
  {
    icon: DraftingCompass,
    title: "Create Your Graph",
    description: "Manually draw nodes and edges, set weights, and visualize algorithms step-by-step on your custom graph.",
    link: "/editor?mode=draw",
    buttonText: "Start Drawing",
    aiHint: "drafting tools"
  },
  {
    icon: ImageUp,
    title: "Graph from Image",
    description: "Upload an image of a graph (e.g., from a textbook or whiteboard) and let AI extract its structure for visualization.",
    link: "/editor?mode=image",
    buttonText: "Analyze Image",
    aiHint: "image upload"
  },
  {
    icon: Shuffle,
    title: "Generate Random Graph",
    description: "Quickly generate a random graph with a specified number of nodes and edge weight ranges to explore algorithms immediately.",
    link: "/editor?mode=random",
    buttonText: "Generate Graph",
    aiHint: "random dice"
  },
];

export default function LandingPage() {
  return (
    <div className="relative container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Background Image: Positioned absolutely, renders behind overlay due to DOM order */}
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Abstract colorful network background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 opacity-30" // No explicit z-index needed here if overlay comes after
        data-ai-hint="vibrant data" // Updated AI hint
        priority
      />
      {/* Gradient Overlay: Positioned absolutely, renders on top of image and behind content */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

      {/* Content: z-10 ensures it's on top of the image and overlay */}
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-foreground">
          Welcome to AlgoViz
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Interactively learn and visualize complex graph algorithms like Dijkstra's, Prim's, and Kruskal's. Choose your path to understanding:
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-5xl">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader className="items-center text-center">
              <div className="p-3 bg-accent/10 rounded-full mb-3">
                <feature.icon className="w-8 h-8 text-accent" /> {/* Changed to text-accent */}
              </div>
              <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow text-center">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={feature.link}>
                  {feature.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="relative z-10 mt-16 text-center">
        <p className="text-muted-foreground">
          Explore algorithm comparisons and real-world applications using the navigation above.
        </p>
      </div>
    </div>
  );
}
