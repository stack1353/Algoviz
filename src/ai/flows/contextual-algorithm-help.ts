
'use server';
/**
 * @fileOverview AI flow to provide contextual help about algorithm visualizations.
 *
 * - getAlgorithmHelp - A function that returns AI-generated suggestions explaining algorithm features.
 * - GetAlgorithmHelpInput - The input type for the getAlgorithmHelp function.
 * - GetAlgorithmHelpOutput - The return type for the getAlgorithmHelp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAlgorithmHelpInputSchema = z.object({
  algorithmName: z
    .string()
    .describe('The name of the algorithm (Dijkstra, Prim, or Kruskal).'),
  visualizationState: z.string().describe('The current state of the algorithm visualization.'),
});
export type GetAlgorithmHelpInput = z.infer<typeof GetAlgorithmHelpInputSchema>;

const GetAlgorithmHelpOutputSchema = z.object({
  explanation: z
    .string()
    .describe('An AI-generated explanation of how the visualization illustrates the algorithm.'),
});
export type GetAlgorithmHelpOutput = z.infer<typeof GetAlgorithmHelpOutputSchema>;

export async function getAlgorithmHelp(input: GetAlgorithmHelpInput): Promise<GetAlgorithmHelpOutput> {
  return getAlgorithmHelpFlow(input);
}

const graphTheoryExamplesTool = ai.defineTool({
  name: 'graphTheoryExamples',
  description: 'Fetches relevant examples from graph theory to illustrate concepts.',
  inputSchema: z.object({
    query: z.string().describe('The query to use when searching for graph theory examples.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // TODO: Implement fetching examples from a local vector database.
  // This is a placeholder implementation.
  return `Example for ${input.query}: A complete graph with n nodes has n*(n-1)/2 edges.`;
});

const algorithmHelpPrompt = ai.definePrompt({
  name: 'algorithmHelpPrompt',
  model: 'googleai/gemini-1.5-pro',
  input: {schema: GetAlgorithmHelpInputSchema},
  output: {schema: GetAlgorithmHelpOutputSchema},
  tools: [graphTheoryExamplesTool],
  prompt: `You are an AI assistant helping students understand graph algorithms.

  The student is currently visualizing the '{{algorithmName}}' algorithm.
  The current state of the visualization is: '{{visualizationState}}'.

  Explain how the visualization illustrates particular features of the algorithm.
  Use the graphTheoryExamples tool to fetch examples from graph theory to illustrate concepts.
  `,
});

const getAlgorithmHelpFlow = ai.defineFlow(
  {
    name: 'getAlgorithmHelpFlow',
    inputSchema: GetAlgorithmHelpInputSchema,
    outputSchema: GetAlgorithmHelpOutputSchema,
  },
  async input => {
    const {output} = await algorithmHelpPrompt(input);
    return output!;
  }
);
