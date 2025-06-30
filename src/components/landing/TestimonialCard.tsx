import { Card, CardContent } from '@/components/ui/card';
import { TestimonialAvatar } from './TestimonialAvatar';

interface TestimonialCardProps {
  rating: number;
  quote: string;
  author: {
    name: string;
    title: string;
  };
}

export function TestimonialCard({ rating, quote, author }: TestimonialCardProps) {
  const stars = '★'.repeat(rating);

  return (
    <Card data-testid="testimonial-card">
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="text-yellow-400">{stars}</div>
        </div>
        <p className="text-muted-foreground mb-4" data-testid="testimonial-content">
          &quot;{quote}&quot;
        </p>
        <div>
          <div data-testid="testimonial-name">{author.name}</div>
          <div data-testid="testimonial-role">{author.title}</div>
        </div>
        <TestimonialAvatar name={author.name} title={author.title} />
      </CardContent>
    </Card>
  );
}
