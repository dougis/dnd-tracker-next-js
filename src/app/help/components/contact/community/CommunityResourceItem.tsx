import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface CommunityResourceItemProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
}

export default function CommunityResourceItem({
  icon: Icon,
  iconColor,
  title,
  description,
  href,
  buttonText,
}: CommunityResourceItemProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {description}
      </p>
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}