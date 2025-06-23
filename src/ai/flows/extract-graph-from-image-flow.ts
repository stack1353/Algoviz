
'use server';
/**
 * @fileOverview AI flow to extract graph structure from an image.
 *
 * - extractGraphFromImage - A function that analyzes an image and returns its graph structure.
 * - ExtractGraphFromImageInput - The input type for the extractGraphFromImage function.
 * - ExtractGraphFromImageOutput - The return type for the extractGraphFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractGraphFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a graph, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractGraphFromImageInput = z.infer<typeof ExtractGraphFromImageInputSchema>;

const ExtractedNodeSchema = z.object({
  id: z.string().describe("A unique identifier for the node as perceived in the image, e.g., 'A', 'N1', 'Node_1'. This ID will be used to define edges."),
  label: z.string().describe("The textual label of the node if visible, otherwise use the id."),
  x: z.number().min(0).max(1).describe("Normalized x-coordinate of the node's center (0.0 for leftmost, 1.0 for rightmost within the graph drawing)."),
  y: z.number().min(0).max(1).describe("Normalized y-coordinate of the node's center (0.0 for topmost, 1.0 for bottommost within the graph drawing)."),
});
export type ExtractedNode = z.infer<typeof ExtractedNodeSchema>;

const ExtractedEdgeSchema = z.object({
  sourceId: z.string().describe("The ID (as defined in the extracted nodes list) of the source node for this edge."),
  targetId: z.string().describe("The ID (as defined in the extracted nodes list) of the target node for this edge."),
  weight: z.number().optional().describe("The numerical weight of the edge if clearly visible. Omit if not visible or not applicable."),
  isDirected: z.boolean().optional().describe("True if the edge is visually indicated as directed (e.g., has an arrowhead). Omit or false if undirected or unclear."),
});
export type ExtractedEdge = z.infer<typeof ExtractedEdgeSchema>;

const ExtractGraphFromImageOutputSchema = z.object({
  nodes: z.array(ExtractedNodeSchema).describe("A list of all identified nodes in the graph."),
  edges: z.array(ExtractedEdgeSchema).describe("A list of all identified edges connecting the nodes."),
  error: z.string().optional().describe("An error message if graph extraction was unsuccessful or ambiguous."),
});
export type ExtractGraphFromImageOutput = z.infer<typeof ExtractGraphFromImageOutputSchema>;


export async function extractGraphFromImage(input: ExtractGraphFromImageInput): Promise<ExtractGraphFromImageOutput> {
  return extractGraphFromImageFlow(input);
}

const extractGraphPrompt = ai.definePrompt({
  name: 'extractGraphFromImagePrompt',
  model: 'googleai/gemini-1.5-pro',
  input: {schema: ExtractGraphFromImageInputSchema},
  output: {schema: ExtractGraphFromImageOutputSchema},
  prompt: `You are an expert system designed to analyze images of graphs and extract their structure.
The user has provided an image of a graph. Your task is to identify all distinct nodes and the edges connecting them.

Image: {{media url=imageDataUri}}

Follow these instructions carefully:
1.  **Nodes**:
    *   Identify each distinct node. Assign a concise, unique 'id' to each node (e.g., "A", "B", "N1"). This 'id' will be used to reference nodes in the 'edges' list.
    *   If a node has a visible textual label, use that for the 'label' field. Otherwise, use the 'id' as the 'label'.
    *   Estimate the normalized 'x' and 'y' coordinates for the center of each node.
        *   'x' should range from 0.0 (leftmost extent of the drawn graph elements) to 1.0 (rightmost extent).
        *   'y' should range from 0.0 (topmost extent of the drawn graph elements) to 1.0 (bottommost extent).
        *   Be precise with these coordinates.

2.  **Edges**:
    *   Identify each edge connecting two nodes.
    *   Use the 'id's you assigned to the nodes for the 'sourceId' and 'targetId' fields.
    *   If an edge has a clearly visible numerical weight, include it in the 'weight' field. If no weight is visible or applicable, omit the 'weight' field.
    *   Determine if an edge is directed (e.g., has an arrowhead pointing from source to target). If so, set 'isDirected' to true. If it's clearly undirected or ambiguous, omit 'isDirected' or set it to false.

3.  **Output Format**: Respond *strictly* in the JSON format defined by the output schema. Ensure all fields are correctly populated.

4.  **Ambiguity/Errors**: If the image is too unclear, does not appear to be a graph, or if you cannot confidently extract the structure, set the 'error' field in your output to a descriptive message and leave nodes/edges empty. Do not attempt to guess if unsure.

Example of a node object: { "id": "N1", "label": "Start", "x": 0.1, "y": 0.5 }
Example of an edge object: { "sourceId": "N1", "targetId": "N2", "weight": 5, "isDirected": true }

Provide the full list of nodes and edges.
`,
});

const extractGraphFromImageFlow = ai.defineFlow(
  {
    name: 'extractGraphFromImageFlow',
    inputSchema: ExtractGraphFromImageInputSchema,
    outputSchema: ExtractGraphFromImageOutputSchema,
  },
  async (input) => {
    const {output} = await extractGraphPrompt(input);
    if (!output) {
        return { nodes: [], edges: [], error: "AI model did not return a valid output."};
    }
    // Ensure nodes and edges are arrays even if the AI messes up
    output.nodes = Array.isArray(output.nodes) ? output.nodes : [];
    output.edges = Array.isArray(output.edges) ? output.edges : [];
    return output;
  }
);
