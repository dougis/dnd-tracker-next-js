import React from 'react';
import QuickStartCard from './getting-started/QuickStartCard';
import KeyFeaturesCard from './getting-started/KeyFeaturesCard';
import WhatsNextCard from './getting-started/WhatsNextCard';

export default function GettingStartedSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Welcome to the D&D Encounter Tracker</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Get started with the most comprehensive D&D encounter management tool.
          Follow this quick start guide to begin tracking your adventures.
        </p>
      </div>

      <QuickStartCard />
      <KeyFeaturesCard />
      <WhatsNextCard />
    </div>
  );
}