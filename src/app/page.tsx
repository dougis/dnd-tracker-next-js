import { CombatTrackerDemo } from '@/components/home/CombatTrackerDemo';
import { CharacterStatsDemo } from '@/components/home/CharacterStatsDemo';
import { ResponsiveGridTest } from '@/components/home/ResponsiveGridTest';
import { ColorPaletteDemo } from '@/components/home/ColorPaletteDemo';

export default function Home() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-fantasy font-bold text-foreground">
          {/* TODO: Internationalize this text */}
          Welcome to D&D Encounter Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your D&D 5e combat encounters with ease
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <CombatTrackerDemo />
          <CharacterStatsDemo />
        </div>

        <ResponsiveGridTest />
        <ColorPaletteDemo />
      </div>
    </div>
  );
}
