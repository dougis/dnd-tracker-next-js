import { CTAButtons } from './CTAButtons';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-fantasy font-bold text-foreground mb-6">
          Master Your D&D Encounters
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The ultimate D&D Encounter Tracker for Dungeon Masters.
          Streamline combat, manage characters, and create epic adventures with ease.
        </p>
        <CTAButtons />
      </div>
    </section>
  );
}
