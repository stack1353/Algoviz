
import './globals.css';
import { Inter, Roboto_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { GraphProvider } from '@/providers/GraphProvider';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'AlgoViz - Interactive Graph Algorithm Visualizer',
  description: 'Learn and visualize graph algorithms like Dijkstra, Prim, and Kruskal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <GraphProvider>
          {children}
          <Toaster />
        </GraphProvider>
      </body>
    </html>
  );
}
