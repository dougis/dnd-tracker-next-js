import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive } from 'lucide-react';

export default function CommonIssuesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-orange-500" />
          Common Issues
        </CardTitle>
        <CardDescription>
          Frequently reported problems and their solutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Character Not Saving</h4>
            <p className="text-xs text-muted-foreground mb-2">
              If character changes aren&apos;t being saved properly:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Check your internet connection</li>
              <li>• Ensure you&apos;re logged in to your account</li>
              <li>• Try saving again after a few seconds</li>
              <li>• Refresh the page and check if changes persisted</li>
            </ul>
            <Badge variant="outline" className="mt-2 text-xs">Common</Badge>
          </div>

          <div className="border rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Encounter Loading Slowly</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Large encounters may take time to load:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Reduce the number of creatures in the encounter</li>
              <li>• Close other browser tabs to free up memory</li>
              <li>• Check for browser extensions that might interfere</li>
              <li>• Try using a different browser</li>
            </ul>
            <Badge variant="outline" className="mt-2 text-xs">Performance</Badge>
          </div>

          <div className="border rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Initiative Not Rolling</h4>
            <p className="text-xs text-muted-foreground mb-2">
              When automatic initiative rolls fail:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Verify all characters have dexterity values</li>
              <li>• Check that initiative hasn&apos;t already been rolled</li>
              <li>• Try manually entering initiative values</li>
              <li>• Restart the encounter if necessary</li>
            </ul>
            <Badge variant="outline" className="mt-2 text-xs">Combat</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}