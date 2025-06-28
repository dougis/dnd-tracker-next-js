import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {

    it('renders correctly', () => {

        render(<Button>Test Button</Button>);
        expect(
            screen.getByRole('button', { name: 'Test Button' })
        ).toBeInTheDocument();

    });

    it('handles click events', async () => {

        const handleClick = jest.fn();
        const user = userEvent.setup();

        render(<Button onClick={handleClick}>Click me</Button>);

        await user.click(screen.getByRole('button', { name: 'Click me' }));
        expect(handleClick).toHaveBeenCalledTimes(1);

    });

    it('applies variant styles correctly', () => {

        const { rerender } = render(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-secondary');

        rerender(<Button variant="destructive">Destructive</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    });

    it('applies size styles correctly', () => {

        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-8');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-10');

    });

    it('is disabled when disabled prop is true', () => {

        render(<Button disabled>Disabled Button</Button>);
        expect(screen.getByRole('button')).toBeDisabled();

    });

    it('renders as child component when asChild is true', () => {

        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );
        expect(screen.getByRole('link')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/test');

    });

});
