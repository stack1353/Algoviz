
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waypoints, Palette, Shuffle, ImageUp, Lightbulb, Brain } from 'lucide-react';
// import Image from 'next/image'; // Keep commented for now

const features = [
  {
    icon: <Waypoints className="w-8 h-8 text-primary" />,
    title: "Visualize Algorithms",
    description: "Watch Dijkstra's, Prim's, and Kruskal's algorithms in action. Understand step-by-step how they build paths and trees.",
    link: "/editor?mode=draw",
    linkText: "Try the Editor"
  },
  {
    icon: <Palette className="w-8 h-8 text-primary" />,
    title: "Interactive Canvas",
    description: "Draw your own graphs directly on the canvas. Add nodes, connect them with weighted edges, and see algorithms run on your creations.",
    link: "/editor?mode=draw",
    linkText: "Draw a Graph"
  },
  {
    icon: <Shuffle className="w-8 h-8 text-primary" />,
    title: "Random Graph Generation",
    description: "Instantly generate random graphs with a specified number of nodes and edge weight ranges to test algorithms on diverse structures.",
    link: "/editor?mode=random",
    linkText: "Generate Random Graph"
  },
  {
    icon: <ImageUp className="w-8 h-8 text-primary" />,
    title: "Graph from Image (AI)",
    description: "Upload an image of a graph, and our AI will attempt to extract its structure, allowing you to visualize algorithms on it.",
    link: "/editor?mode=image",
    linkText: "Upload Image"
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
    title: "Real-World Applications",
    description: "Explore how these fundamental graph algorithms are used in GPS navigation, network design, circuit planning, and more.",
    link: "/applications",
    linkText: "See Applications"
  },
  {
    icon: <Brain className="w-8 h-8 text-primary" />,
    title: "Contextual AI Help",
    description: "Stuck on a step? Get AI-powered explanations for the current state of an algorithm's visualization directly in the editor.",
    link: "/editor?mode=draw",
    linkText: "Get AI Help"
  }
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Image - Intentionally commented out to isolate 500 error
      <Image
        src="/my-custom-background.png" // Ensure this image is in public folder
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
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/editor?mode=draw">Get Started with Editor</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="shadow-lg">
              <Link href="/comparison">Compare Algorithms</Link>
            </Button>
          </div>

          <section className="mt-16 md:mt-24">
            <h2 className="text-3xl font-bold font-headline tracking-tight text-foreground mb-10">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-left shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                  <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
                    <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold pt-1">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                  <CardContent className="pt-0">
                     <Button asChild variant="link" className="p-0 h-auto text-primary">
                       <Link href={feature.link}>{feature.linkText} &rarr;</Link>
                     </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
