import { render, screen } from '@testing-library/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

describe('Card Components', () => {

    it('renders Card with all components correctly', () => {

        render(
            <Card data-testid="card">
                <CardHeader>
                    <CardTitle>Test Title</CardTitle>
                    <CardDescription>Test Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Test Content</p>
                </CardContent>
            </Card>
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();

    });

    it('applies correct CSS classes', () => {

        render(
            <Card data-testid="card">
                <CardHeader data-testid="header">
                    <CardTitle data-testid="title">Title</CardTitle>
                    <CardDescription data-testid="description">
            Description
                    </CardDescription>
                </CardHeader>
                <CardContent data-testid="content">Content</CardContent>
            </Card>
        );

        expect(screen.getByTestId('card')).toHaveClass(
            'rounded-xl border bg-card text-card-foreground shadow'
        );
        expect(screen.getByTestId('header')).toHaveClass(
            'flex flex-col space-y-1.5 p-6'
        );
        expect(screen.getByTestId('title')).toHaveClass(
            'font-semibold leading-none tracking-tight'
        );
        expect(screen.getByTestId('description')).toHaveClass(
            'text-sm text-muted-foreground'
        );
        expect(screen.getByTestId('content')).toHaveClass('p-6 pt-0');

    });

    it('can be used with D&D-themed classes', () => {

        render(
            <Card className="character-pc combat-card" data-testid="dnd-card">
                <CardContent>PC Character Card</CardContent>
            </Card>
        );

        expect(screen.getByTestId('dnd-card')).toHaveClass(
            'character-pc combat-card'
        );

    });

});
