import React from 'react';
import { render, screen } from '@testing-library/react';
import { GridLayout } from '../GridLayout';

describe('GridLayout', () => {
  it('should render children correctly', () => {
    render(
      <GridLayout>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </GridLayout>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should apply default grid classes', () => {
    render(
      <GridLayout>
        <div>Test child</div>
      </GridLayout>
    );

    const container = screen.getByText('Test child').parentElement;
    expect(container).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      'gap-6'
    );
  });

  it('should apply custom className', () => {
    render(
      <GridLayout className="custom-class">
        <div>Test child</div>
      </GridLayout>
    );

    const container = screen.getByText('Test child').parentElement;
    expect(container).toHaveClass('custom-class');
    // Should still have default classes
    expect(container).toHaveClass('grid', 'grid-cols-1');
  });

  it('should handle empty className', () => {
    render(
      <GridLayout className="">
        <div>Test child</div>
      </GridLayout>
    );

    const container = screen.getByText('Test child').parentElement;
    expect(container).toHaveClass('grid');
  });

  it('should handle no children', () => {
    render(<GridLayout />);

    // Should render empty container with grid classes
    const container = document.querySelector('.grid');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      'gap-6'
    );
  });

  it('should handle multiple custom classes', () => {
    render(
      <GridLayout className="custom-1 custom-2 custom-3">
        <div>Test child</div>
      </GridLayout>
    );

    const container = screen.getByText('Test child').parentElement;
    expect(container).toHaveClass('custom-1', 'custom-2', 'custom-3');
    expect(container).toHaveClass('grid');
  });

  it('should render complex children structure', () => {
    render(
      <GridLayout>
        <div>
          <span>Nested content</span>
          <button>Button</button>
        </div>
        <article>
          <h2>Article title</h2>
          <p>Article content</p>
        </article>
      </GridLayout>
    );

    expect(screen.getByText('Nested content')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('Article title')).toBeInTheDocument();
    expect(screen.getByText('Article content')).toBeInTheDocument();
  });
});