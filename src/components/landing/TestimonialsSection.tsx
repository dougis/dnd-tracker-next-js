import { TestimonialCard } from './TestimonialCard';

const testimonials = [
  {
    rating: 5,
    quote: 'This encounter tracker has completely transformed my D&D sessions. The initiative system is flawless and the lair actions feature is a game-changer!',
    author: { name: 'Sarah M.', title: 'DM for 5 years' }
  },
  {
    rating: 5,
    quote: 'Finally, an encounter tracker that understands D&D 5e rules! The multiclass character support saved me hours of manual calculation.',
    author: { name: 'Marcus R.', title: 'Professional DM' }
  },
  {
    rating: 5,
    quote: 'The mobile interface is perfect for in-person sessions. I can manage everything from my tablet without missing a beat.',
    author: { name: 'Alex K.', title: 'Casual DM' }
  }
];

export function TestimonialsSection() {
  return (
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
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            rating={testimonial.rating}
            quote={testimonial.quote}
            author={testimonial.author}
          />
        ))}
      </div>
    </section>
  );
}
