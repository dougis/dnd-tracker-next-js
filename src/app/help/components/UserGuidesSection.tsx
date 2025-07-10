import React from 'react';
import CharacterGuideCard from './guides/CharacterGuideCard';
import EncounterGuideCard from './guides/EncounterGuideCard';
import CombatGuideCard from './guides/CombatGuideCard';
import AdvancedGuideCard from './guides/AdvancedGuideCard';
import ProTipsCard from './guides/ProTipsCard';

export default function UserGuidesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">User Guides & Tutorials</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Detailed step-by-step tutorials for mastering every aspect of the D&D Encounter Tracker.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CharacterGuideCard />
        <EncounterGuideCard />
        <CombatGuideCard />
        <AdvancedGuideCard />
      </div>

      <ProTipsCard />
    </div>
  );
}