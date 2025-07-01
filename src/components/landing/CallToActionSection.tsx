import { CTAButtons } from './CTAButtons';

export function CallToActionSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center bg-primary/5">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-serif font-bold mb-4">
          Ready to Start Your Epic Encounters Today?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of Dungeon Masters who trust our encounter tracker to
          streamline combat and enhance their games. Save time, manage
          characters effortlessly, and perfect your DM sessions with our trusted
          community.
        </p>
        <CTAButtons />
      </div>
    </section>
  );
}
