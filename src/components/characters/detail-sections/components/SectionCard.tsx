import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const SectionHeader = ({ title }: { title: string }) => (
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
);

const getContentClassName = (hasTitle: boolean) => hasTitle ? undefined : 'pt-4';

export const SectionCard = ({ title, children, className }: SectionCardProps) => (
  <Card className={className}>
    {title && <SectionHeader title={title} />}
    <CardContent className={getContentClassName(!!title)}>
      {children}
    </CardContent>
  </Card>
);