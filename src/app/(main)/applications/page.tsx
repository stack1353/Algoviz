
import { ApplicationCard } from "@/components/ApplicationCard";
import { CardDescription, CardHeader, CardTitle }_ from "@/components/ui/card";

const applications = [
  {
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "GPS navigation system on a phone",
    title: "GPS Navigation & Route Planning",
    description: "Dijkstra's algorithm is fundamental in GPS systems to find the shortest route between two locations. Roads are represented as edges and intersections as nodes, with edge weights being distance or travel time.",
    tags: ["Navigation", "Logistics", "Mapping", "Shortest Path"],
    aiHint: "gps map"
  },
  {
    algorithmName: "Dijkstra's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Network routers and servers",
    title: "Network Routing (OSPF)",
    description: "Open Shortest Path First (OSPF) is a widely used routing protocol that employs Dijkstra's algorithm to determine the most efficient path for data packets to travel across a computer network.",
    tags: ["Networking", "Internet", "Data Transfer", "Routing"],
    aiHint: "network server"
  },
  {
    algorithmName: "Prim's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Electrical power grid towers",
    title: "Network Design (Power, Cable)",
    description: "Prim's algorithm helps design networks like electrical grids or cable TV networks by finding the minimum total length of connections needed to link all points, ensuring cost-effectiveness.",
    tags: ["Infrastructure", "Civil Engineering", "MST", "Optimization"],
    aiHint: "power grid"
  },
  {
    algorithmName: "Prim's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Abstract representation of data clusters",
    title: "Clustering Algorithms",
    description: "Variations of Prim's algorithm can be used in some clustering methods, where the goal is to group similar data points together by forming a minimum spanning tree of the data points.",
    tags: ["Data Science", "Machine Learning", "Pattern Recognition", "MST"],
    aiHint: "data cluster"
  },
  {
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Circuit board with intricate connections",
    title: "Circuit Board Design",
    description: "Kruskal's algorithm can optimize connections on a circuit board by finding the minimum total wire length needed to connect all components, preventing cycles and minimizing material usage.",
    tags: ["Electronics", "Hardware", "Optimization", "MST"],
    aiHint: "circuit board"
  },
  {
    algorithmName: "Kruskal's Algorithm",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Islands connected by bridges",
    title: "Connecting Points with Minimum Cost",
    description: "Imagine connecting a set of islands with bridges at minimum total construction cost. Kruskal's algorithm is ideal for such scenarios where you select the cheapest connections without forming redundant paths (cycles).",
    tags: ["Logistics", "Urban Planning", "Resource Management", "MST"],
    aiHint: "island bridge"
  },
];

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <CardTitle className="text-3xl md:text-4xl font-headline">Real-World Applications</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          Discover how graph algorithms power everyday technologies and solve complex problems.
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
