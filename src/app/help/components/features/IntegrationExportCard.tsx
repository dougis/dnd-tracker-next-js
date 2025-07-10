import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function IntegrationExportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Integration & Export
        </CardTitle>
        <CardDescription>
          Import and export capabilities for various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Import Options</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• D&D Beyond character sheets</li>
              <li>• Roll20 character data</li>
              <li>• JSON character files</li>
              <li>• CSV encounter data</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Export Formats</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• PDF character sheets</li>
              <li>• JSON data exports</li>
              <li>• Combat log reports</li>
              <li>• Campaign summaries</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}