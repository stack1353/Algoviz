
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface ApplicationCardProps {
  algorithmName: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  tags: string[];
  aiHint: string;
}

export function ApplicationCard({ algorithmName, imageUrl, imageAlt, title, description, tags, aiHint }: ApplicationCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-primary/30 transition-all duration-300 ease-in-out group border-2 border-transparent hover:border-primary/20">
      <CardHeader className="pt-5 px-5 pb-0">
        <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden border border-border group-hover:border-primary/30 transition-colors duration-300">
          <Image
            src={imageUrl}
            alt={imageAlt}
            layout="fill"
            objectFit="cover"
            data-ai-hint={aiHint}
            className="transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/5 transition-all duration-300"></div>
        </div>
        <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
        <CardDescription className="flex items-center text-sm pt-1">
          <Lightbulb className="w-4 h-4 mr-2 text-primary transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:-rotate-6" />
          Application of {algorithmName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-5 py-3">
        <p className="text-muted-foreground text-sm line-clamp-4">{description}</p>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">{tag}</Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
