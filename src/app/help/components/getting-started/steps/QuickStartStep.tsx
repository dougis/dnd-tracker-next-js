import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface QuickStartStepProps {
  stepNumber: number;
  title: string;
  description: string;
  linkHref: string;
  linkText: string;
  icon: LucideIcon;
}

export default function QuickStartStep({
  stepNumber,
  title,
  description,
  linkHref,
  linkText,
  icon: Icon,
}: QuickStartStepProps) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      <Badge variant="outline" className="mt-1">{stepNumber}</Badge>
      <div className="flex-1">
        <h4 className="font-semibold mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground mb-3">
          {description}
        </p>
        <Link
          href={linkHref}
          className="text-primary hover:underline text-sm font-medium"
        >
          {linkText} →
        </Link>
      </div>
      <Icon className="h-8 w-8 text-primary opacity-50" />
    </div>
  );
}