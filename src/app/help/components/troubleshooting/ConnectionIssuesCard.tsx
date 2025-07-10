import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi } from 'lucide-react';

export default function ConnectionIssuesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-green-500" />
          Connection Issues
        </CardTitle>
        <CardDescription>
          Resolving network and connectivity problems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">Sync Problems</h4>
            <p className="text-xs text-muted-foreground mb-2">
              When data isn&apos;t syncing across devices:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Ensure you&apos;re logged into the same account</li>
              <li>• Force refresh the page (Ctrl+F5)</li>
              <li>• Log out and log back in</li>
              <li>• Check for multiple browser windows</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Offline Mode</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Limited functionality when offline:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Active combat sessions continue to work</li>
              <li>• New characters/encounters cannot be created</li>
              <li>• Changes sync when connection resumes</li>
              <li>• Consider downloading PDFs for offline reference</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}