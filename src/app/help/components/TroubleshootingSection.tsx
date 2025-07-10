import React from 'react';
import QuickFixAlert from './troubleshooting/QuickFixAlert';
import CommonIssuesCard from './troubleshooting/CommonIssuesCard';
import BrowserCompatibilityCard from './troubleshooting/BrowserCompatibilityCard';
import ConnectionIssuesCard from './troubleshooting/ConnectionIssuesCard';
import CacheStorageCard from './troubleshooting/CacheStorageCard';
import BugReportingCard from './troubleshooting/BugReportingCard';

export default function TroubleshootingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Troubleshooting Guides</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Solutions to common issues and technical problems you might encounter.
        </p>
      </div>

      <QuickFixAlert />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CommonIssuesCard />
        <BrowserCompatibilityCard />
        <ConnectionIssuesCard />
        <CacheStorageCard />
      </div>

      <BugReportingCard />
    </div>
  );
}