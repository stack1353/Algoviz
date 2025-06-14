
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
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="relative w-full h-48 mb-4 rounded-t-lg overflow-hidden">
          <Image 
            src={imageUrl} 
            alt={imageAlt} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint={aiHint}
          />
        </div>
        <CardTitle className="text-xl font-headline">{title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <Lightbulb className="w-4 h-4 mr-2 text-primary" />
          Application of {algorithmName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
