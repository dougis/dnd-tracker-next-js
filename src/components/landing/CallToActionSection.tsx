import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CallToActionSection() {
  return (
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
  );
}
