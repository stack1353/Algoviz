import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import { Toaster } from "@/components/ui/toaster";
// import { GraphProvider } from '@/providers/GraphProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AlgoViz: Graph Algorithm Visualizer',
  description: 'Interactively learn graph algorithms like Dijkstra, Prim, and Kruskal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* <GraphProvider> */}
          {children}
        {/* </GraphProvider> */}
        {/* <Toaster /> */}
      </body>
    </html>
  );
}
