import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard = ({ title, children, className }: SectionCardProps) => (
  <Card className={className}>
    {title && (
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent className={!title ? 'pt-4' : undefined}>
      {children}
    </CardContent>
  </Card>
);