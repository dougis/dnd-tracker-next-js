import { Metadata } from 'next';
import { EncounterListView } from '@/components/encounter/EncounterListView';

export const metadata: Metadata = {
  title: 'Encounters - D&D Encounter Tracker',
  description: 'Manage and organize your D&D encounters',
};

export default function EncountersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Encounters</h1>
        <p className="text-muted-foreground">
          Manage and organize your combat encounters
        </p>
      </div>
      <EncounterListView />
    </div>
  );
}