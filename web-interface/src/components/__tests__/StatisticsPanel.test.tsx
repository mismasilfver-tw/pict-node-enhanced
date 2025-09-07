import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import StatisticsPanel from "../StatisticsPanel";

describe("StatisticsPanel", () => {
  const mockStatistics = {
    order: 2,
    generatedTests: 12,
    theoreticalMax: 36,
    coveragePercentage: 83.33,
    efficiency: "High",
    constraintReduction: 25.0,
  };

  test("renders statistics panel with basic data", () => {
    render(<StatisticsPanel statistics={mockStatistics} />);

    expect(screen.getByText("Coverage Statistics")).toBeInTheDocument();
    expect(screen.getByText(/Order:/)).toBeInTheDocument();
    expect(screen.getByText(/2-way/)).toBeInTheDocument();
    expect(screen.getByText(/Generated Tests:/)).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/Theoretical Maximum:/)).toBeInTheDocument();
    expect(screen.getByText("36")).toBeInTheDocument();
    expect(screen.getByText(/Coverage:/)).toBeInTheDocument();
    expect(screen.getByText("83.3%")).toBeInTheDocument();
  });

  test("toggles detailed statistics when show/hide button is clicked", () => {
    render(<StatisticsPanel statistics={mockStatistics} />);

    // Initially, detailed stats should not be visible
    expect(screen.queryByText(/Efficiency:/)).not.toBeInTheDocument();

    // Click show details button
    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    // Now detailed stats should be visible
    expect(screen.getByText(/Efficiency:/)).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText(/Constraint Reduction:/)).toBeInTheDocument();
    expect(screen.getByText("25.0%")).toBeInTheDocument();

    // Click hide details button
    fireEvent.click(screen.getByRole("button", { name: /hide details/i }));

    // Detailed stats should be hidden again
    expect(screen.queryByText(/Efficiency:/)).not.toBeInTheDocument();
  });

  test("opens and closes info modal", async () => {
    render(<StatisticsPanel statistics={mockStatistics} />);

    // Initially, modal should not be visible
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click info button to open modal
    fireEvent.click(
      screen.getByRole("button", { name: /learn about these statistics/i }),
    );

    // Get the modal and verify it's visible with the correct title
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent("Understanding Coverage Statistics");

    // Check for content that's unique to the modal
    expect(modal).toHaveTextContent("Example:");
    expect(modal).toHaveTextContent("3 parameters, each with 3 values");

    // Find and click the close button in the modal header
    const closeButton = within(modal).getByLabelText("Close");
    fireEvent.click(closeButton);

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("does not render when statistics are null", () => {
    render(<StatisticsPanel statistics={null} />);
    expect(screen.queryByText("Coverage Statistics")).not.toBeInTheDocument();
  });

  test("does not render when isVisible is false", () => {
    render(<StatisticsPanel statistics={mockStatistics} isVisible={false} />);
    expect(screen.queryByText("Coverage Statistics")).not.toBeInTheDocument();
  });

  test("renders numeric efficiency as percentage and assigns success variant (>= 0.75)", () => {
    const stats = {
      ...mockStatistics,
      efficiency: 0.82,
    };
    render(<StatisticsPanel statistics={stats} />);
    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    const efficiencyBadge = screen.getByText("82%");
    expect(efficiencyBadge).toHaveClass("bg-success");
  });

  test("assigns warning variant for numeric efficiency in [0.5, 0.75)", () => {
    const stats = {
      ...mockStatistics,
      efficiency: 0.6,
    };
    render(<StatisticsPanel statistics={stats} />);
    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    const efficiencyBadge = screen.getByText("60%");
    expect(efficiencyBadge).toHaveClass("bg-warning");
  });

  test("assigns danger variant for numeric efficiency < 0.5", () => {
    const stats = {
      ...mockStatistics,
      efficiency: 0.3,
    };
    render(<StatisticsPanel statistics={stats} />);
    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    const efficiencyBadge = screen.getByText("30%");
    expect(efficiencyBadge).toHaveClass("bg-danger");
  });

  test("maps string efficiencies High/Medium/Low to correct variants", () => {
    // Test High
    const highStats = { ...mockStatistics, efficiency: "High" };
    const { rerender } = render(<StatisticsPanel statistics={highStats} />);
    fireEvent.click(screen.getByRole("button", { name: /show details/i }));
    expect(screen.getByText("High")).toHaveClass("bg-success");

    // Test Medium
    const medStats = { ...mockStatistics, efficiency: "Medium" };
    rerender(<StatisticsPanel statistics={medStats} />);
    expect(screen.getByText("Medium")).toHaveClass("bg-warning");

    // Test Low
    const lowStats = { ...mockStatistics, efficiency: "Low" };
    rerender(<StatisticsPanel statistics={lowStats} />);
    expect(screen.getByText("Low")).toHaveClass("bg-danger");
  });
});
