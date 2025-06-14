
import { ComparisonTable } from "@/components/ComparisonTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComparisonPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-headline">Algorithm Comparison</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            A quick overview of Dijkstra's, Prim's, and Kruskal's algorithms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonTable />
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Notes on Complexity:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li><strong className="text-foreground">V</strong> represents the number of vertices (nodes).</li>
              <li><strong className="text-foreground">E</strong> represents the number of edges.</li>
              <li><strong className="text-foreground">O(V log V) or O(E log V)</strong> complexities often depend on using a priority queue (like a binary heap).</li>
              <li><strong className="text-foreground">O(E log E)</strong> for Kruskal's is dominated by edge sorting.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
