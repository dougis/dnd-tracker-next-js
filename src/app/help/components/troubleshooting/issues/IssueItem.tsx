import React from 'react';
import { Badge } from '@/components/ui/badge';

interface IssueItemProps {
  title: string;
  description: string;
  solutions: string[];
  category: string;
}

export default function IssueItem({
  title,
  description,
  solutions,
  category,
}: IssueItemProps) {
  return (
    <div className="border rounded-lg p-3">
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <p className="text-xs text-muted-foreground mb-2">
        {description}
      </p>
      <ul className="text-xs text-muted-foreground space-y-1 ml-4">
        {solutions.map((solution, index) => (
          <li key={index}>• {solution}</li>
        ))}
      </ul>
      <Badge variant="outline" className="mt-2 text-xs">{category}</Badge>
    </div>
  );
}