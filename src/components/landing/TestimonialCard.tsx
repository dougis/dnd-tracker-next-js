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
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="text-yellow-400">{stars}</div>
        </div>
        <p className="text-muted-foreground mb-4">
          &quot;{quote}&quot;
        </p>
        <TestimonialAvatar name={author.name} title={author.title} />
      </CardContent>
    </Card>
  );
}
