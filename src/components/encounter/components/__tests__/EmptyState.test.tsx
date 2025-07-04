import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render with default props', () => {
    render(<EmptyState />);

    expect(screen.getByText('No encounters found')).toBeInTheDocument();
    expect(screen.getByText(/Create your first encounter to get started/)).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    render(
      <EmptyState
        title="Custom Title"
        description="Custom description text"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<EmptyState />);

    const outerContainer = screen.getByText('No encounters found').closest('div')?.parentElement;
    expect(outerContainer).toHaveClass('text-center', 'py-12');

    const innerContainer = screen.getByText('No encounters found').closest('div');
    expect(innerContainer).toHaveClass('max-w-sm', 'mx-auto');
  });

  it('should render title with correct styling', () => {
    render(<EmptyState title="Test Title" />);

    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('text-lg', 'font-medium', 'mb-2');
  });

  it('should render description with correct styling', () => {
    render(<EmptyState description="Test description" />);

    const description = screen.getByText('Test description');
    expect(description).toHaveClass('text-muted-foreground', 'mb-6');
  });
});