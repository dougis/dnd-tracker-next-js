import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button asChild size="lg" className="text-lg px-8 py-3">
        <Link href={'/auth/signup' as any}>Get Started Free</Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
        <Link href={'/auth/signin' as any}>Sign In</Link>
      </Button>
    </div>
  );
}
