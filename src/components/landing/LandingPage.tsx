import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-fantasy font-bold text-foreground mb-6">
            Master Your D&D Encounters
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate D&D Encounter Tracker for Dungeon Masters.
            Streamline combat, manage characters, and create epic adventures with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Everything You Need for Epic D&D Encounters
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional tools designed specifically for D&D 5e combat management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Image src="/features/initiative-tracker.png" alt="Initiative Tracking" width={32} height={32} />
              </div>
              <CardTitle>
                <h3>Initiative Tracking</h3>
              </CardTitle>
              <CardDescription>
                Automatic initiative rolling with dexterity tiebreakers. Never lose track of turn order again.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Image src="/features/hp-management.png" alt="HP Management" width={32} height={32} />
              </div>
              <CardTitle>HP & AC Management</CardTitle>
              <CardDescription>
                Real-time health tracking with damage calculation, healing, and temporary HP support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Image src="/features/character-management.png" alt="Character Management" width={32} height={32} />
              </div>
              <CardTitle>Character Management</CardTitle>
              <CardDescription>
                Complete character sheets with multiclass support and D&D 5e rule compliance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Image src="/features/encounter-builder.png" alt="Encounter Builder" width={32} height={32} />
              </div>
              <CardTitle>Encounter Builder</CardTitle>
              <CardDescription>
                Drag-and-drop encounter creation with CR calculation and balancing tools.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Image src="/features/lair-actions.png" alt="Lair Actions" width={32} height={32} />
              </div>
              <CardTitle>Lair Actions</CardTitle>
              <CardDescription>
                Unique lair action support that competitors don&apos;t offer. Enhance your boss encounters.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Image src="/features/mobile-ready.png" alt="Mobile Ready" width={32} height={32} />
              </div>
              <CardTitle>Mobile & Desktop</CardTitle>
              <CardDescription>
                Responsive design optimized for both mobile and desktop gaming sessions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
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
          <Card className="relative">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Most Popular</Badge>
              <CardTitle>Free Adventurer</CardTitle>
              <div className="text-3xl font-bold">$0<span className="text-lg font-normal">/month</span></div>
              <CardDescription>Perfect for starting your first campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 1 party</li>
                <li>✓ 3 encounters</li>
                <li>✓ 10 creatures</li>
                <li>✓ Basic initiative tracking</li>
                <li>✓ HP/AC management</li>
              </ul>
              <Button asChild className="w-full mt-6">
                <Link href="/signup">Start Free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seasoned Adventurer</CardTitle>
              <div className="text-3xl font-bold">$4.99<span className="text-lg font-normal">/month</span></div>
              <CardDescription>For regular D&D sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 3 parties</li>
                <li>✓ 15 encounters</li>
                <li>✓ 50 creatures</li>
                <li>✓ Advanced encounter tools</li>
                <li>✓ Character import/export</li>
              </ul>
              <Button asChild variant="outline" className="w-full mt-6">
                <Link href="/signup">Choose Plan</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expert Dungeon Master</CardTitle>
              <div className="text-3xl font-bold">$9.99<span className="text-lg font-normal">/month</span></div>
              <CardDescription>For serious campaign management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 10 parties</li>
                <li>✓ 50 encounters</li>
                <li>✓ 200 creatures</li>
                <li>✓ Lair actions support</li>
                <li>✓ Advanced analytics</li>
              </ul>
              <Button asChild variant="outline" className="w-full mt-6">
                <Link href="/signup">Choose Plan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Testimonials from Fellow DMs
          </h2>
          <p className="text-xl text-muted-foreground">
            See what the D&D community is saying about our encounter tracker
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-muted-foreground mb-4">
                &quot;This encounter tracker has completely transformed my D&D sessions.
                The initiative system is flawless and the lair actions feature is a game-changer!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold">Sarah M.</div>
                  <div className="text-sm text-muted-foreground">DM for 5 years</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-muted-foreground mb-4">
                &quot;Finally, an encounter tracker that understands D&D 5e rules!
                The multiclass character support saved me hours of manual calculation.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold">Marcus R.</div>
                  <div className="text-sm text-muted-foreground">Professional DM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-muted-foreground mb-4">
                &quot;The mobile interface is perfect for in-person sessions.
                I can manage everything from my tablet without missing a beat.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold">Alex K.</div>
                  <div className="text-sm text-muted-foreground">Casual DM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center bg-primary/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Ready to Level Up Your D&D Sessions?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of Dungeon Masters who trust our encounter tracker for their campaigns.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/signup">Start Your Free Campaign</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
