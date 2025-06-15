// import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { CheckCircle, Zap, Users, BarChart3 } from "lucide-react";

// const features = [
//   {
//     icon: <Zap className="h-8 w-8 text-primary mb-4" />,
//     title: "Interactive Visualizations",
//     description: "Watch algorithms like Dijkstra's, Prim's, and Kruskal's come to life. Understand each step with clear, animated graph changes.",
//     dataAiHint: "algorithm animation"
//   },
//   {
//     icon: <Users className="h-8 w-8 text-primary mb-4" />,
//     title: "Real-time Collaboration (Coming Soon)",
//     description: "Work with peers on the same graph, learning and solving problems together in an interactive environment.",
//     dataAiHint: "team collaboration"
//   },
//   {
//     icon: <BarChart3 className="h-8 w-8 text-primary mb-4" />,
//     title: "Performance Comparison",
//     description: "Compare algorithm complexities and see how they perform on different graph structures and sizes.",
//     dataAiHint: "chart graph"
//   },
//   {
//     icon: <CheckCircle className="h-8 w-8 text-primary mb-4" />,
//     title: "Easy to Use Interface",
//     description: "A clean, intuitive interface designed to make learning graph algorithms straightforward and enjoyable.",
//     dataAiHint: "user interface"
//   },
// ];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main hero section */}
      <section className="relative flex-grow flex flex-col items-center justify-center text-center px-4 py-12 md:py-24">
        {/* Background Image and Overlay
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="https://placehold.co/1920x1080.png" // Replace with your desired image
            alt="Abstract colorful network background"
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint="vibrant data"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
        </div>
        */}

        {/* Content on top */}
        <div className="relative z-20 container mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
            Visualize Graph Algorithms
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
            Explore Dijkstra's, Prim's, and Kruskal's algorithms step-by-step. Build, analyze, and understand complex graph structures with ease.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/editor?mode=draw">Start Visualizing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/comparison">Compare Algorithms</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Kept commented for simplicity during 500 error debug */}
      {/*
      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center text-foreground mb-12">
            Why AlgoViz?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-center items-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      */}
    </div>
  );
}
