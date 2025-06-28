
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const algorithmsData = [
  {
    name: "Dijkstra's",
    type: "Shortest Path",
    timeComplexity: "O(V^2) or O(E + V log V)",
    spaceComplexity: "O(V + E)",
    useCases: "GPS navigation, network routing protocols.",
    pros: ["Finds shortest path in weighted graphs", "Works with non-negative weights"],
    cons: ["Doesn't work with negative weights", "Can be slower than A* for specific goals"],
    weighted: true,
    negativeWeights: false,
  },
  {
    name: "Prim's",
    type: "Minimum Spanning Tree",
    timeComplexity: "O(V^2) or O(E log V)",
    spaceComplexity: "O(V + E)",
    useCases: "Network design (e.g., connecting cities with minimum cable), clustering.",
    pros: ["Simple to implement", "Efficient for dense graphs (with adjacency matrix and V^2)"],
    cons: ["Only for undirected graphs"],
    weighted: true,
    negativeWeights: true, // MST algorithms generally handle negative weights correctly if they exist
  },
  {
    name: "Kruskal's",
    type: "Minimum Spanning Tree",
    timeComplexity: "O(E log E) or O(E log V)",
    spaceComplexity: "O(V + E)",
    useCases: "Circuit design, connecting islands with bridges at minimum cost.",
    pros: ["Conceptually simple", "Efficient for sparse graphs (edges sorted first)"],
    cons: ["Requires Disjoint Set Union (DSU) structure", "Only for undirected graphs"],
    weighted: true,
    negativeWeights: true,
  },
];

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-headline">Algorithm</TableHead>
            <TableHead className="font-headline">Type</TableHead>
            <TableHead className="font-headline">Time Complexity</TableHead>
            <TableHead className="font-headline">Space Complexity</TableHead>
            <TableHead className="font-headline">Key Use Cases</TableHead>
            <TableHead className="font-headline text-center">Weighted Graphs</TableHead>
            <TableHead className="font-headline text-center">Negative Weights</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {algorithmsData.map((algo) => (
            <TableRow key={algo.name}>
              <TableCell className="font-medium">{algo.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{algo.type}</Badge>
              </TableCell>
              <TableCell>{algo.timeComplexity}</TableCell>
              <TableCell>{algo.spaceComplexity}</TableCell>
              <TableCell className="max-w-xs">{algo.useCases}</TableCell>
              <TableCell className="text-center">
                {algo.weighted ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
              </TableCell>
              <TableCell className="text-center">
                {algo.name === "Dijkstra's" && !algo.negativeWeights ? 
                  <XCircle className="h-5 w-5 text-red-500 mx-auto" /> : 
                (algo.negativeWeights ? 
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : 
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
