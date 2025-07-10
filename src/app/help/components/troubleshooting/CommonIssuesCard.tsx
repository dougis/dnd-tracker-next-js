import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';
import IssueItem from './issues/IssueItem';

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
          <IssueItem
            title="Character Not Saving"
            description="If character changes aren't being saved properly:"
            solutions={[
              "Check your internet connection",
              "Ensure you're logged in to your account",
              "Try saving again after a few seconds",
              "Refresh the page and check if changes persisted"
            ]}
            category="Common"
          />
          <IssueItem
            title="Encounter Loading Slowly"
            description="Large encounters may take time to load:"
            solutions={[
              "Reduce the number of creatures in the encounter",
              "Close other browser tabs to free up memory",
              "Check for browser extensions that might interfere",
              "Try using a different browser"
            ]}
            category="Performance"
          />
          <IssueItem
            title="Initiative Not Rolling"
            description="When automatic initiative rolls fail:"
            solutions={[
              "Verify all characters have dexterity values",
              "Check that initiative hasn't already been rolled",
              "Try manually entering initiative values",
              "Restart the encounter if necessary"
            ]}
            category="Combat"
          />
        </div>
      </CardContent>
    </Card>
  );
}