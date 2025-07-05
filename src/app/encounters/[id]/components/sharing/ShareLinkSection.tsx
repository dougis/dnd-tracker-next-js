import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyIcon } from 'lucide-react';
import { generateShareLink, copyToClipboard } from '@/lib/utils/encounter-utils';
import type { Types } from 'mongoose';

interface ShareLinkSectionProps {
  encounterId: string | Types.ObjectId;
  showShareLink: boolean;
  onGenerateLink: () => void;
}

/**
 * Handle share link generation and copying
 */
export function ShareLinkSection({ encounterId, showShareLink, onGenerateLink }: ShareLinkSectionProps) {
  const shareLink = generateShareLink(encounterId);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareLink);
    if (success) {
      // TODO: Show toast notification
      console.log('Link copied to clipboard');
    }
  };

  if (!showShareLink) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onGenerateLink}
        className="w-full"
      >
        Generate Share Link
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex">
        <Input
          value={shareLink}
          readOnly
          className="text-xs"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="ml-2"
        >
          <CopyIcon className="h-4 w-4" />
          Copy Link
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Anyone with this link can view the encounter
      </p>
    </div>
  );
}