# **App Name**: AlgoViz

## Core Features:

- Graph Editor: Interactive canvas for users to draw graphs with nodes and weighted edges.
- Dijkstra Visualization: Visualize Dijkstra’s Algorithm step-by-step with animated path highlighting.
- Prim's Visualization: Visualize Prim’s Algorithm step-by-step, highlighting edges as they're added to the MST.
- Kruskal Visualization: Visualize Kruskal’s Algorithm, showing the selection of edges to form the MST.
- Algorithm Comparison: Comparison page displaying a table of characteristics (speed, use cases, complexity) of Dijkstra, Prim, and Kruskal.
- Real-World Applications: Applications page presenting real-world applications of Dijkstra, Prim, and Kruskal algorithms with descriptive explanations.
- Contextual Algorithm Help: Use generative AI to offer helpful suggestions to explain how the algorithm visualization illustrates particular features of each algorithm; the LLM will use a tool to fetch from a local vector database to offer examples from graph theory for its explanation.

## Style Guidelines:

- Primary color: Saturated blue (#4285F4) to provide a calm and reliable aesthetic. This will contrast well with both light and dark schemes.
- Background color: Light gray (#F0F2F5) provides a neutral, distraction-free background for educational content.
- Accent color: Vibrant orange (#FF7043) to highlight important interactive elements and guide user attention.
- Body and headline font: 'Inter' (sans-serif) provides a modern and easily readable font for all text elements.
- Use clear, consistent icons from a set like Material Design Icons for all interactive elements.
- Implement a clean, intuitive layout optimized for educational use, using React components, dividing the screen into graph editor, algorithm control panel, and information sections.
- Employ smooth transitions and animations to illustrate algorithm steps and provide feedback to user interactions.