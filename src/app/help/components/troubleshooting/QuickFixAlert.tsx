import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function QuickFixAlert() {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Quick Fix Checklist</AlertTitle>
      <AlertDescription>
        Before diving into specific issues, try these common solutions:
        <br />
        1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
        <br />
        2. Clear your browser cache and cookies
        <br />
        3. Check your internet connection
        <br />
        4. Try using an incognito/private browsing window
      </AlertDescription>
    </Alert>
  );
}