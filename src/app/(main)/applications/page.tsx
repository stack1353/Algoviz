
import Link from 'next/link';
import { ApplicationCard } from "@/components/ApplicationCard";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const applications = [
  {
    id: "gps-navigation",
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
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
    apps: applications.filter(app => app.algorithmName === "Dijkstra's Algorithm")
  },
  {
    name: "Prim's Algorithm",
    apps: applications.filter(app => app.algorithmName === "Prim's Algorithm")
  },
  {
    name: "Kruskal's Algorithm",
    apps: applications.filter(app => app.algorithmName === "Kruskal's Algorithm")
  }
];

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <CardTitle className="text-3xl md:text-4xl font-headline">Real-World Applications & Visualizations</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          Explore how graph algorithms solve practical problems. Click an application to visualize it in the editor.
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-8">
        {algorithmGroups.map((group) => (
          <section key={group.name} className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-primary text-center md:text-left font-headline border-b-2 border-primary/30 pb-2">
              {group.name}
            </h2>
            {group.apps.map((app) => (
              <Link 
                key={app.id} 
                href={`/editor?application=${app.id}&algorithm=${encodeURIComponent(app.algorithmName)}`}
                className="block hover:scale-[1.02] transition-transform duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
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
          </section>
        ))}
      </div>
    </div>
  );
}
