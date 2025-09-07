import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatisticsPanel from '../StatisticsPanel';

describe('StatisticsPanel Component', () => {
  const mockStatistics = {
    order: 2,
    generatedTests: 12,
    theoreticalMax: 36,
    coveragePercentage: 83.33,
    efficiency: 'High',
    constraintReduction: 25.0
  };

  test('renders statistics panel with basic data', () => {
    render(<StatisticsPanel statistics={mockStatistics} />);
    
    // Check if main elements are rendered
    expect(screen.getByText('Coverage Statistics')).toBeInTheDocument();
    expect(screen.getByText(/Order:/)).toBeInTheDocument();
    expect(screen.getByText(/2-way/)).toBeInTheDocument();
    expect(screen.getByText(/Generated Tests:/)).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText(/Theoretical Maximum:/)).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByText(/Coverage:/)).toBeInTheDocument();
    expect(screen.getByText('83.3%')).toBeInTheDocument();
  });

  test('toggles detailed statistics when show/hide button is clicked', () => {
    render(<StatisticsPanel statistics={mockStatistics} />);
    
    // Initially, detailed stats should not be visible
    expect(screen.queryByText(/Efficiency:/)).not.toBeInTheDocument();
    
    // Click show details button
    fireEvent.click(screen.getByText(/Show Details/));
    
    // Now detailed stats should be visible
    expect(screen.getByText(/Efficiency:/)).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText(/Constraint Reduction:/)).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    
    // Click hide details button
    fireEvent.click(screen.getByText(/Hide Details/));
    
    // Detailed stats should be hidden again
    expect(screen.queryByText(/Efficiency:/)).not.toBeInTheDocument();
  });

  test('opens info modal when info button is clicked', async () => {
    render(<StatisticsPanel statistics={mockStatistics} />);
    
    // Initially, modal should not be visible
    expect(screen.queryByText('Understanding Coverage Statistics')).not.toBeInTheDocument();
    
    // Click info button
    fireEvent.click(screen.getByTitle('Learn about these statistics'));
    
    // Now modal should be visible
    expect(screen.getByText('Understanding Coverage Statistics')).toBeInTheDocument();
    
    // Check that the modal contains the expected content
    const modalBody = screen.getByText('Understanding Coverage Statistics').closest('.modal-content');
    expect(modalBody).toBeInTheDocument();
    
    // Check for the example section which is unique to the modal
    expect(screen.getByText('Example:')).toBeInTheDocument();
    expect(screen.getByText(/3 parameters, each with 3 values/)).toBeInTheDocument();
    
    // Close modal using the close button in the header (more reliable)
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    // Wait for modal to close and verify it's gone
    await waitFor(() => {
      expect(screen.queryByText('Understanding Coverage Statistics')).not.toBeInTheDocument();
    });
  });

  test('does not render when statistics are null', () => {
    render(<StatisticsPanel statistics={null} />);
    expect(screen.queryByText('Coverage Statistics')).not.toBeInTheDocument();
  });

  test('does not render when isVisible is false', () => {
    render(<StatisticsPanel statistics={mockStatistics} isVisible={false} />);
    expect(screen.queryByText('Coverage Statistics')).not.toBeInTheDocument();
  });

  test('renders numeric efficiency as percentage and assigns success variant (>= 0.75)', () => {
    const stats = {
      ...mockStatistics,
      efficiency: 0.82,
    };
    render(<StatisticsPanel statistics={stats} />);
    fireEvent.click(screen.getByText(/Show Details/));
    const efficiencyBadge = screen.getByText('82%');
    // react-bootstrap adds bg-* class to Badge
    expect(efficiencyBadge).toHaveClass('bg-success');
  });

  test('assigns warning variant for numeric efficiency in [0.5, 0.75)', () => {
    const stats = {
      ...mockStatistics,
      efficiency: 0.6,
    };
    render(<StatisticsPanel statistics={stats} />);
    fireEvent.click(screen.getByText(/Show Details/));
    const efficiencyBadge = screen.getByText('60%');
    expect(efficiencyBadge).toHaveClass('bg-warning');
  });

  test('assigns danger variant for numeric efficiency < 0.5', () => {
    const stats = {
      ...mockStatistics,
      efficiency: 0.3,
    };
    render(<StatisticsPanel statistics={stats} />);
    fireEvent.click(screen.getByText(/Show Details/));
    const efficiencyBadge = screen.getByText('30%');
    expect(efficiencyBadge).toHaveClass('bg-danger');
  });

  test('maps string efficiencies High/Medium/Low to correct variants', () => {
    const highStats = { ...mockStatistics, efficiency: 'High' as const };
    const medStats = { ...mockStatistics, efficiency: 'Medium' as const };
    const lowStats = { ...mockStatistics, efficiency: 'Low' as const };

    // High
    const { unmount: unmountHigh } = render(<StatisticsPanel statistics={highStats} />);
    fireEvent.click(screen.getByText(/Show Details/));
    expect(screen.getByText('High')).toHaveClass('bg-success');
    unmountHigh();

    // Medium
    const { unmount: unmountMed } = render(<StatisticsPanel statistics={medStats} />);
    fireEvent.click(screen.getByText(/Show Details/));
    expect(screen.getByText('Medium')).toHaveClass('bg-warning');
    unmountMed();

    // Low
    render(<StatisticsPanel statistics={lowStats} />);
    fireEvent.click(screen.getByText(/Show Details/));
    expect(screen.getByText('Low')).toHaveClass('bg-danger');
  });
});
