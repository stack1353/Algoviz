
import { ApplicationCard } from "@/components/ApplicationCard";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const applications = [
  {
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "GPS navigation system visualizing a route",
    title: "GPS Navigation & Route Planning Visualization",
    description: "Visualize Dijkstra's on a city map: intersections are nodes, roads are edges with travel times. Select start/end points. Watch as roads are explored (highlighted blue), finalized short paths (green nodes), and the current node pulses. The final shortest route is drawn prominently in orange, showing total travel time. This demonstrates how GPS finds optimal routes by systematically checking paths.",
    tags: ["Navigation", "Logistics", "Mapping", "Shortest Path", "Visualization"],
    aiHint: "gps navigation"
  },
  {
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Network routers visualizing data packet flow",
    title: "Network Routing (OSPF) Visualization",
    description: "See Dijkstra determine data paths: routers are nodes, links are edges with latency costs. Pick source/destination routers. Links turn blue as they're explored. Animate a data packet icon along the final shortest path. Simulate link failures and watch Dijkstra dynamically find new optimal routes, illustrating network resilience and efficiency.",
    tags: ["Networking", "Internet", "Data Transfer", "Routing", "Visualization"],
    aiHint: "network routers"
  },
  {
    algorithmName: "Prim's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Power grid design visualization",
    title: "Network Design (Power/Cable) Visualization",
    description: "Visualize Prim's building a cost-effective network: points represent houses/substations. Start from one point; the MST grows by adding the cheapest edge to an unlinked point. Highlight added edges and nodes. This shows how Prim's connects all points with minimum total 'cable length' (sum of weights).",
    tags: ["Infrastructure", "Civil Engineering", "MST", "Optimization", "Visualization"],
    aiHint: "power lines"
  },
  {
    algorithmName: "Prim's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Abstract visualization of data clustering with MST",
    title: "Clustering Algorithms (Conceptual) Visualization",
    description: "See how Prim's can conceptually aid clustering: data points are nodes, edges weighted by distance. Prim's builds an MST. After, highlight and 'remove' the longest MST edges; this visually separates points into natural clusters, showing how MSTs find data backbones.",
    tags: ["Data Science", "Machine Learning", "Pattern Recognition", "MST", "Visualization"],
    aiHint: "data points"
  },
  {
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Circuit board design visualization with Kruskal's",
    title: "Circuit Board Design Visualization",
    description: "Visualize Kruskal's optimizing circuit connections: components are nodes, potential wires are edges sorted by cost. Kruskal iterates: if a wire (edge) doesn't form a cycle, it's added (solid color); if it does, it's discarded (flashes red). This clearly shows cycle avoidance and minimizing material.",
    tags: ["Electronics", "Hardware", "Optimization", "MST", "Visualization"],
    aiHint: "pcb design"
  },
  {
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Islands connected by bridges visualization",
    title: "Connecting Islands (Minimum Cost Bridges) Visualization",
    description: "Illustrate Kruskal's connecting islands: islands are nodes, potential bridges are edges sorted by construction cost. The algorithm adds the cheapest bridges one by one, skipping any that create redundant paths (cycles), resulting in a minimum-cost connected network of bridges.",
    tags: ["Logistics", "Urban Planning", "Resource Management", "MST", "Visualization"],
    aiHint: "island bridges"
  },
];

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <CardTitle className="text-3xl md:text-4xl font-headline">Real-World Applications & Visualizations</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          Discover how graph algorithms power everyday technologies and how their steps can be visualized in applied contexts.
        </CardDescription>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <ApplicationCard
            key={app.title}
            algorithmName={app.algorithmName}
            imageUrl={app.imageUrl}
            imageAlt={app.imageAlt}
            title={app.title}
            description={app.description}
            tags={app.tags}
            aiHint={app.aiHint}
          />
        ))}
      </div>
    </div>
  );
}
