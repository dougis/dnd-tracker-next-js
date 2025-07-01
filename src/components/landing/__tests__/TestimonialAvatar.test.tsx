import { render, screen } from '@testing-library/react';
import { TestimonialAvatar } from '../TestimonialAvatar';

const mockProps = {
  name: 'John Smith',
  title: 'Dungeon Master',
};

describe('TestimonialAvatar Component', () => {
  beforeEach(() => {
    render(<TestimonialAvatar {...mockProps} />);
  });

  it('renders the testimonial avatar container', () => {
    const avatar = screen.getByTestId('testimonial-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('displays the provided name', () => {
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('displays the provided title', () => {
    expect(screen.getByText('Dungeon Master')).toBeInTheDocument();
  });

  it('applies correct styling to the avatar circle', () => {
    const avatar = screen.getByTestId('testimonial-avatar');
    expect(avatar).toHaveClass(
      'w-10',
      'h-10',
      'bg-primary/10',
      'rounded-full',
      'mr-3'
    );
  });

  it('applies correct styling to the name', () => {
    const nameElement = screen.getByText('John Smith');
    expect(nameElement).toHaveClass('font-semibold');
  });

  it('applies correct styling to the title', () => {
    const titleElement = screen.getByText('Dungeon Master');
    expect(titleElement).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('uses flexbox layout for proper alignment', () => {
    const container = screen.getByTestId('testimonial-avatar').parentElement;
    expect(container).toHaveClass('flex', 'items-center');
  });

  it('renders with different props', () => {
    const differentProps = {
      name: 'Jane Doe',
      title: 'Campaign Player',
    };

    render(<TestimonialAvatar {...differentProps} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Campaign Player')).toBeInTheDocument();
  });
});
