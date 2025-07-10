import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';

export default function BugReportingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-500" />
          Reporting Bugs
        </CardTitle>
        <CardDescription>
          How to report technical issues and bugs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Before Reporting</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Try the quick fix checklist above</li>
              <li>• Check if the issue is reproducible</li>
              <li>• Note your browser and operating system</li>
              <li>• Gather any error messages or screenshots</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">What to Include</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Steps to reproduce the issue</li>
              <li>• Expected vs. actual behavior</li>
              <li>• Browser and version information</li>
              <li>• Screenshots or screen recordings if applicable</li>
              <li>• Account information (subscription tier, etc.)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">How to Report</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Email: support@dndtracker.com</li>
              <li>• Use the &quot;Contact Support&quot; form in app</li>
              <li>• GitHub Issues for technical users</li>
              <li>• Discord server for community help</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}