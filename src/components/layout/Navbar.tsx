"use client";

import Link from "next/link";
import { Network, Home, GitCompareArrows, Shapes } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/comparison", label: "Comparison", icon: GitCompareArrows },
  { href: "/applications", label: "Applications", icon: Shapes },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Network className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">AlgoViz</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline-block">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        {/* Future placeholder for theme toggle or user auth */}
      </div>
    </header>
  );
}
