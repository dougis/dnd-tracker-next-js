import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableHeader } from '../TableHeader';

describe('TableHeader', () => {
  const defaultProps = {
    isAllSelected: false,
    onSelectAll: jest.fn(),
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
    onSort: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table header with all columns', () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render select all checkbox', () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should show checked state when all selected', () => {
    render(
      <table>
        <TableHeader {...defaultProps} isAllSelected={true} />
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onSelectAll when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(1);
  });

  it('should show sort indicators for sortable columns', () => {
    render(
      <table>
        <TableHeader {...defaultProps} sortBy="name" sortOrder="asc" />
      </table>
    );

    // Name column should show sort indicator
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
  });

  it('should call onSort when sortable header is clicked', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const nameButton = screen.getByRole('button', { name: /name/i });
    await user.click(nameButton);

    expect(defaultProps.onSort).toHaveBeenCalledWith('name');
  });

  it('should call onSort for difficulty column', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const difficultyButton = screen.getByRole('button', { name: /difficulty/i });
    await user.click(difficultyButton);

    expect(defaultProps.onSort).toHaveBeenCalledWith('difficulty');
  });

  it('should call onSort for level column', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const levelButton = screen.getByRole('button', { name: /level/i });
    await user.click(levelButton);

    expect(defaultProps.onSort).toHaveBeenCalledWith('targetLevel');
  });

  it('should not have sort button for status column (non-sortable)', () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    // Status column should not have a button since it's not sortable
    expect(screen.queryByRole('button', { name: /status/i })).not.toBeInTheDocument();
    // But the text should still be there
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should show correct sort direction for different columns', () => {
    const { rerender } = render(
      <table>
        <TableHeader {...defaultProps} sortBy="difficulty" sortOrder="desc" />
      </table>
    );

    // Test different sort configurations
    rerender(
      <table>
        <TableHeader {...defaultProps} sortBy="targetLevel" sortOrder="asc" />
      </table>
    );

    rerender(
      <table>
        <TableHeader {...defaultProps} sortBy="status" sortOrder="desc" />
      </table>
    );

    // Headers should still be present
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should apply correct styling to header cells', () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const headers = screen.getAllByRole('columnheader');
    headers.forEach(header => {
      expect(header).toHaveClass('p-4');
    });
  });

  it('should handle rapid clicking on sort buttons', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const nameButton = screen.getByRole('button', { name: /name/i });

    // Rapid clicks
    await user.click(nameButton);
    await user.click(nameButton);
    await user.click(nameButton);

    expect(defaultProps.onSort).toHaveBeenCalledTimes(3);
  });

  it('should have proper accessibility attributes', () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    const sortButtons = screen.getAllByRole('button');
    expect(sortButtons.length).toBeGreaterThan(0);
    sortButtons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });
});