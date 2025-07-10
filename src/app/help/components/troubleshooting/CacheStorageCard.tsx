import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export default function CacheStorageCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-purple-500" />
          Cache & Storage
        </CardTitle>
        <CardDescription>
          Managing browser data and storage issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">Clearing Cache and Cookies</h4>
            <p className="text-xs text-muted-foreground mb-2">
              For Chrome/Edge:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)</li>
              <li>• Select &quot;Cookies and other site data&quot;</li>
              <li>• Select &quot;Cached images and files&quot;</li>
              <li>• Click &quot;Clear data&quot;</li>
            </ul>

            <p className="text-xs text-muted-foreground mt-3 mb-2">
              For Firefox:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)</li>
              <li>• Select &quot;Cookies&quot; and &quot;Cache&quot;</li>
              <li>• Click &quot;Clear Now&quot;</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Storage Full</h4>
            <p className="text-xs text-muted-foreground mb-2">
              If you receive storage errors:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Clear browser cache and storage</li>
              <li>• Close unused browser tabs</li>
              <li>• Export/backup important data first</li>
              <li>• Consider upgrading to a paid plan for more storage</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}