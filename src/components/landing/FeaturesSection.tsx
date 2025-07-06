import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FeatureIcon } from './FeatureIcon';

const features = [
  {
    icon: '/features/initiative-tracker.svg',
    title: 'Initiative Tracking',
    description:
      'Automatic initiative rolling with dexterity tiebreakers. Never lose track of turn order again.',
  },
  {
    icon: '/features/hp-management.svg',
    title: 'HP & AC Management',
    description:
      'Real-time health tracking with damage calculation, healing, and temporary HP support.',
  },
  {
    icon: '/features/character-management.svg',
    title: 'Character Management',
    description:
      'Complete character sheets with multiclass support and D&D 5e rule compliance.',
  },
  {
    icon: '/features/encounter-builder.svg',
    title: 'Encounter Builder',
    description:
      'Drag-and-drop encounter creation with CR calculation and balancing tools.',
  },
  {
    icon: '/features/lair-actions.svg',
    title: 'Lair Actions',
    description:
      "Unique lair action support that competitors don't offer. Enhance your boss encounters.",
  },
  {
    icon: '/features/mobile-ready.svg',
    title: 'Mobile & Tablet Ready',
    description:
      'Responsive design optimized for mobile, tablet and desktop gaming sessions with real-time collaboration.',
  },
];

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold mb-4">
          Everything You Need for Epic D&D Encounters
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional tools designed specifically for D&D 5e combat management
          and Dungeon Master workflow optimization
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <FeatureIcon src={feature.icon} alt={feature.title} />
              <CardTitle>
                <h3>{feature.title}</h3>
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
