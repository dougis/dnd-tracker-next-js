import { render, screen } from '@testing-library/react';
import { TestimonialCard } from '../TestimonialCard';

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, 'data-testid': testId }: any) => (
    <div data-testid={testId}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

// Mock the TestimonialAvatar component
jest.mock('../TestimonialAvatar', () => ({
  TestimonialAvatar: ({ name, title }: { name: string; title: string }) => (
    <div data-testid="testimonial-avatar">
      <div>{name}</div>
      <div>{title}</div>
    </div>
  ),
}));

const mockProps = {
  rating: 5,
  quote: "This tool has revolutionized how I run my D&D campaigns!",
  author: {
    name: 'Sarah Johnson',
    title: 'Experienced DM',
  },
};

describe('TestimonialCard Component', () => {
  beforeEach(() => {
    render(<TestimonialCard {...mockProps} />);
  });

  it('renders the testimonial card container', () => {
    const card = screen.getByTestId('testimonial-card');
    expect(card).toBeInTheDocument();
  });

  it('displays the correct number of stars based on rating', () => {
    const stars = screen.getByText('★★★★★');
    expect(stars).toBeInTheDocument();
    expect(stars).toHaveClass('text-yellow-400');
  });

  it('displays the testimonial quote with proper formatting', () => {
    const quote = screen.getByTestId('testimonial-content');
    expect(quote).toBeInTheDocument();
    expect(quote).toHaveTextContent('"This tool has revolutionized how I run my D&D campaigns!"');
    expect(quote).toHaveClass('text-muted-foreground', 'mb-4');
  });

  it('displays the author name', () => {
    const authorName = screen.getByTestId('testimonial-name');
    expect(authorName).toBeInTheDocument();
    expect(authorName).toHaveTextContent('Sarah Johnson');
  });

  it('displays the author title/role', () => {
    const authorRole = screen.getByTestId('testimonial-role');
    expect(authorRole).toBeInTheDocument();
    expect(authorRole).toHaveTextContent('Experienced DM');
  });

  it('includes the TestimonialAvatar component', () => {
    const avatar = screen.getByTestId('testimonial-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('passes correct props to TestimonialAvatar', () => {
    const avatar = screen.getByTestId('testimonial-avatar');
    expect(avatar).toHaveTextContent('Sarah Johnson');
    expect(avatar).toHaveTextContent('Experienced DM');
  });

  it('applies proper card styling', () => {
    const cardContent = screen.getByText('★★★★★').closest('div')?.parentElement?.parentElement;
    expect(cardContent).toHaveClass('pt-6');
  });
});

describe('TestimonialCard Component - Different Props', () => {
  it('renders different ratings correctly', () => {
    const differentProps = {
      ...mockProps,
      rating: 3,
    };

    render(<TestimonialCard {...differentProps} />);

    const stars = screen.getByText('★★★');
    expect(stars).toBeInTheDocument();
  });

  it('handles different quote content', () => {
    const differentProps = {
      ...mockProps,
      quote: 'Amazing tool for combat management!',
    };

    render(<TestimonialCard {...differentProps} />);

    const quote = screen.getByTestId('testimonial-content');
    expect(quote).toHaveTextContent('"Amazing tool for combat management!"');
  });

  it('handles different author information', () => {
    const differentProps = {
      ...mockProps,
      author: {
        name: 'Mike Chen',
        title: 'New DM',
      },
    };

    render(<TestimonialCard {...differentProps} />);

    const authorName = screen.getByTestId('testimonial-name');
    const authorRole = screen.getByTestId('testimonial-role');

    expect(authorName).toHaveTextContent('Mike Chen');
    expect(authorRole).toHaveTextContent('New DM');
  });

});