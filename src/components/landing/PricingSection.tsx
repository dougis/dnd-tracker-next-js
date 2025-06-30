import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const pricingTiers = [
  {
    name: 'Free Adventurer',
    price: '$0',
    description: 'Perfect for starting your first campaign',
    popular: true,
    features: [
      '1 party',
      '3 encounters',
      '10 creatures',
      'Basic initiative tracking',
      'HP/AC management'
    ]
  },
  {
    name: 'Seasoned Adventurer',
    price: '$4.99',
    description: 'For regular D&D sessions',
    popular: false,
    features: [
      '3 parties',
      '15 encounters',
      '50 creatures',
      'Advanced encounter tools',
      'Character import/export'
    ]
  },
  {
    name: 'Expert Dungeon Master',
    price: '$9.99',
    description: 'For serious campaign management',
    popular: false,
    features: [
      '10 parties',
      '50 encounters',
      '200 creatures',
      'Lair actions support',
      'Advanced analytics'
    ]
  }
];

export function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-16 bg-muted/50">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold mb-4">
          Choose Your Subscription Tier
        </h2>
        <p className="text-xl text-muted-foreground">
          Start free and upgrade as your campaigns grow
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              {tier.popular && <Badge variant="secondary" className="w-fit">Most Popular</Badge>}
              <CardTitle>{tier.name}</CardTitle>
              <div className="text-3xl font-bold">{tier.price}<span className="text-lg font-normal">/month</span></div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>✓ {feature}</li>
                ))}
              </ul>
              <Button asChild className={`w-full mt-6 ${tier.popular ? '' : 'variant-outline'}`} variant={tier.popular ? 'default' : 'outline'}>
                <Link href="/signup">{tier.popular ? 'Start Free' : 'Choose Plan'}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
