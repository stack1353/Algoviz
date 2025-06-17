
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

// This data remains the same as it defines the applications and their details
const applications = [
  {
    id: "gps-navigation",
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "https://placehold.co/600x400.png", // Kept for potential future use or if linking directly
    imageAlt: "GPS navigation system visualizing a route",
    title: "GPS Route Planning",
    description: "Visualize Dijkstra's on a city map: intersections are nodes, roads are edges with travel times. Select start/end points. Watch as roads are explored (highlighted blue), finalized short paths (green nodes), and the current node pulses. The final shortest route is drawn prominently in orange, showing total travel time. This demonstrates how GPS finds optimal routes by systematically checking paths.",
    tags: ["Navigation", "Logistics", "Mapping", "Shortest Path"],
    aiHint: "gps navigation"
  },
  {
    id: "network-routing-ospf",
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Network routers visualizing data packet flow",
    title: "Network Routing (OSPF)",
    description: "See Dijkstra determine data paths: routers are nodes, links are edges with latency costs. Pick source/destination routers. Links turn blue as they're explored. Animate a data packet icon along the final shortest path. Simulate link failures and watch Dijkstra dynamically find new optimal routes, illustrating network resilience and efficiency.",
    tags: ["Networking", "Internet", "Data Transfer", "Routing"],
    aiHint: "network routers"
  },
  {
    id: "network-design-power-cable",
    algorithmName: "Prim's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Power grid design visualization",
    title: "Power Grid Design",
    description: "Visualize Prim's building a cost-effective network: points represent houses/substations. Start from one point; the MST grows by adding the cheapest edge to an unlinked point. Highlight added edges and nodes. This shows how Prim's connects all points with minimum total 'cable length' (sum of weights).",
    tags: ["Infrastructure", "Civil Engineering", "MST", "Optimization"],
    aiHint: "power lines"
  },
  {
    id: "clustering-conceptual",
    algorithmName: "Prim's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Abstract visualization of data clustering with MST",
    title: "Conceptual Data Clustering",
    description: "See how Prim's can conceptually aid clustering: data points are nodes, edges weighted by distance. Prim's builds an MST. After, highlight and 'remove' the longest MST edges; this visually separates points into natural clusters, showing how MSTs find data backbones.",
    tags: ["Data Science", "Machine Learning", "MST"],
    aiHint: "data points"
  },
  {
    id: "circuit-board-design",
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Circuit board design visualization with Kruskal's",
    title: "Circuit Board Connections",
    description: "Visualize Kruskal's optimizing circuit connections: components are nodes, potential wires are edges sorted by cost. Kruskal iterates: if a wire (edge) doesn't form a cycle, it's added (solid color); if it does, it's discarded (flashes red). This clearly shows cycle avoidance and minimizing material.",
    tags: ["Electronics", "Hardware", "Optimization", "MST"],
    aiHint: "pcb design"
  },
  {
    id: "connecting-islands-bridges",
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Islands connected by bridges visualization",
    title: "Connecting Islands (Bridges)",
    description: "Illustrate Kruskal's connecting islands: islands are nodes, potential bridges are edges sorted by construction cost. The algorithm adds the cheapest bridges one by one, skipping any that create redundant paths (cycles), resulting in a minimum-cost connected network of bridges.",
    tags: ["Logistics", "Urban Planning", "MST"],
    aiHint: "island bridges"
  },
];

const algorithmGroups = [
  {
    name: "Dijkstra's Algorithm",
    apps: applications.filter(app => app.algorithmName === "Dijkstra's Algorithm"),
    description: "Finds the shortest path in networks like GPS or data routing."
  },
  {
    name: "Prim's Algorithm",
    apps: applications.filter(app => app.algorithmName === "Prim's Algorithm"),
    description: "Builds minimum cost networks, like power grids or data clusters."
  },
  {
    name: "Kruskal's Algorithm",
    apps: applications.filter(app => app.algorithmName === "Kruskal's Algorithm"),
    description: "Connects components efficiently, like circuits or island bridges."
  }
];

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <CardTitle className="text-3xl md:text-4xl font-headline">Real-World Applications & Visualizations</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          Explore how graph algorithms solve practical problems. Select an algorithm, then choose an application to visualize it in the editor.
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-8">
        {algorithmGroups.map((group) => (
          <Card key={group.name} className="flex flex-col shadow-xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 ease-in-out transform hover:scale-[1.02] bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-primary text-center font-headline">
                {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center flex-grow p-6 pt-0 text-center">
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                {group.description}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="lg" className="w-full max-w-xs shadow-md hover:shadow-lg transition-shadow">
                    Select Example <ChevronDown className="ml-2 h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72 bg-popover shadow-xl rounded-md border-border">
                  {group.apps.map((app) => (
                    <DropdownMenuItem key={app.id} asChild className="focus:bg-accent focus:text-accent-foreground">
                      <Link
                        href={`/editor?application=${app.id}&algorithm=${encodeURIComponent(app.algorithmName)}`}
                        className="block w-full text-left p-2 text-sm"
                        aria-label={`Visualize ${app.title}`}
                      >
                        {app.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {group.apps.length === 0 && (
                    <DropdownMenuItem disabled className="p-2 text-sm">No applications available</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
