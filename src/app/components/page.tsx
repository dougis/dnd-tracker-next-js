
'use client';

import ButtonShowcase from '@/components/showcase/ButtonShowcase';
import FormShowcase from '@/components/showcase/FormShowcase';
import CharacterShowcase from '@/components/showcase/CharacterShowcase';
import InteractiveShowcase from '@/components/showcase/InteractiveShowcase';
import ThemeShowcase from '@/components/showcase/ThemeShowcase';

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-fantasy font-bold text-foreground">
            D&D Tracker Component Library
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Showcasing shadcn/ui components integrated with our D&D-themed
            design system
          </p>
        </div>

        {/* Component Showcases */}
        <ButtonShowcase />
        <FormShowcase />
        <CharacterShowcase />
        <InteractiveShowcase />
        <ThemeShowcase />

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Components successfully integrated with D&D Tracker design system
          </p>
        </div>
      </div>
    </div>
  );
}
