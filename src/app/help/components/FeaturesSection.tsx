import React from 'react';
import CharacterManagementCard from './features/CharacterManagementCard';
import EncounterBuilderCard from './features/EncounterBuilderCard';
import InitiativeTrackerCard from './features/InitiativeTrackerCard';
import HPTrackingCard from './features/HPTrackingCard';
import SubscriptionTiersCard from './features/SubscriptionTiersCard';
import IntegrationExportCard from './features/IntegrationExportCard';

export default function FeaturesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Feature Documentation</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Comprehensive guide to all D&D Encounter Tracker features and capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CharacterManagementCard />
        <EncounterBuilderCard />
        <InitiativeTrackerCard />
        <HPTrackingCard />
      </div>

      <SubscriptionTiersCard />
      <IntegrationExportCard />
    </div>
  );
}