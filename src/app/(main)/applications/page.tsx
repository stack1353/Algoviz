
import Link from 'next/link';
import { ApplicationCard } from "@/components/ApplicationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const applications = [
  {
    id: "gps-navigation",
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "/images/app-gps-navigation.png",
    imageAlt: "GPS navigation system visualizing a route",
    title: "GPS Route Planning",
    description: "Visualize on a city map: intersections as nodes, roads as edges (travel time/distance). Select start/end points. Animation: Dijkstra explores roads (blue highlights), finalized shortest path nodes (green), current node pulses. The final route is drawn in orange, showing total travel time/distance. Illustrates optimal GPS routing.",
    tags: ["Navigation", "Logistics", "Mapping", "Shortest Path"],
    aiHint: "city map"
  },
  {
    id: "network-routing-ospf",
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "/images/app-network-routing.png",
    imageAlt: "Network routers visualizing data packet flow",
    title: "Network Routing (OSPF)",
    description: "Visualize on a network diagram: routers as nodes, links as edges (latency/cost). Select source/destination routers. Animation: Links turn blue as explored. A data packet icon moves along the final shortest path. Simulate link failures to see Dijkstra find new optimal routes, showing network resilience.",
    tags: ["Networking", "Internet", "Data Transfer", "Routing"],
    aiHint: "network diagram"
  },
  {
    id: "network-design-power-cable",
    algorithmName: "Prim's Algorithm",
    imageUrl: "/images/app-power-grid.png",
    imageAlt: "Power grid design visualization",
    title: "Power Grid Design",
    description: "Visualize on a canvas: points are houses/substations. Use pre-set scenarios (e.g., connect 5 towns). Animation: Prim's starts from one point; the MST grows by adding the cheapest edge to an unlinked point. Highlighted edges/nodes show how all points connect with minimum 'cable length'. Output: Total Minimum Cable Length.",
    tags: ["Infrastructure", "Civil Engineering", "MST", "Optimization"],
    aiHint: "power grid"
  },
  {
    id: "clustering-conceptual",
    algorithmName: "Prim's Algorithm",
    imageUrl: "/images/app-data-clustering.png",
    imageAlt: "Abstract visualization of data clustering with MST",
    title: "Conceptual Data Clustering",
    description: "Visualize on a 2D plane: data points as nodes, edges weighted by distance. Animation: Prim's builds an MST connecting all data points. Post-Processing: Highlight and 'remove' the longest MST edges; this visually separates points into natural clusters, showing how MSTs find data backbones.",
    tags: ["Data Science", "Machine Learning", "MST", "Pattern Recognition"],
    aiHint: "data clusters"
  },
  {
    id: "circuit-board-design",
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "/images/app-circuit-board.png",
    imageAlt: "Circuit board design visualization with Kruskal's",
    title: "Circuit Board Connections",
    description: "Visualize on a board: components as nodes, potential wires as edges sorted by cost. Animation: Kruskal iterates: if a wire (edge) doesn't form a cycle, it's added (solid color); if it does, it's discarded (flashes red). Shows cycle avoidance and minimizing material. Output: Total Minimum Wire Length.",
    tags: ["Electronics", "Hardware", "Optimization", "MST"],
    aiHint: "circuit board"
  },
  {
    id: "connecting-islands-bridges",
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "/images/app-island-bridges.png",
    imageAlt: "Islands connected by bridges visualization",
    title: "Connecting Islands (Bridges)",
    description: "Visualize islands as nodes, potential bridges as edges sorted by construction cost. Animation: Add the cheapest bridges one by one, skipping any that create redundant paths (cycles), resulting in a minimum-cost connected network of bridges.",
    tags: ["Logistics", "Urban Planning", "Infrastructure", "MST"],
    aiHint: "island network"
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
        <CardDescription className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Explore how graph algorithms solve practical problems. Click on an application to see how it could be visualized in the editor.
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-10">
        {algorithmGroups.map((group) => (
          <div key={group.name} className="flex flex-col space-y-6 items-center md:items-stretch">
            <Card className="w-full max-w-md md:max-w-none bg-card/50 shadow-md border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary font-headline">
                  {group.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground px-2 pt-1">
                  {group.description}
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="space-y-4 w-full max-w-md md:max-w-none">
              {group.apps.map((app) => (
                <Link
                  key={app.id}
                  href={`/editor?application=${app.id}&algorithm=${encodeURIComponent(app.algorithmName)}`}
                  className="block transform hover:scale-[1.02] transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg outline-none"
                  aria-label={`Visualize ${app.title}`}
                >
                  <ApplicationCard
                    algorithmName={app.algorithmName}
                    imageUrl={app.imageUrl}
                    imageAlt={app.imageAlt}
                    title={app.title}
                    description={app.description}
                    tags={app.tags}
                    aiHint={app.aiHint}
                  />
                </Link>
              ))}
              {group.apps.length === 0 && (
                 <Card><CardContent><p className="p-4 text-sm text-muted-foreground text-center">No applications available for {group.name}.</p></CardContent></Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
