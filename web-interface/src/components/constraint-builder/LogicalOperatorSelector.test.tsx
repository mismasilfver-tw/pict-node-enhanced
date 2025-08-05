import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LogicalOperatorSelector, {
  LogicalOperator,
} from "./LogicalOperatorSelector";

describe("LogicalOperatorSelector", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test("renders both AND and OR options", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="AND"
        onChange={mockOnChange}
        label="Logical Operator"
      />,
    );

    expect(screen.getByText("AND")).toBeInTheDocument();
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  test("renders with label when provided", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="AND"
        onChange={mockOnChange}
        label="Combine with"
      />,
    );

    expect(screen.getByText("Combine with")).toBeInTheDocument();
  });

  test("AND is selected by default when selectedOperator is AND", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="AND"
        onChange={mockOnChange}
        label="Logical Operator"
      />,
    );

    const andButton = screen.getByLabelText("AND");
    const orButton = screen.getByLabelText("OR");

    expect(andButton).toBeChecked();
    expect(orButton).not.toBeChecked();
  });

  test("OR is selected when selectedOperator is OR", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="OR"
        onChange={mockOnChange}
        label="Logical Operator"
      />,
    );

    const andButton = screen.getByLabelText("AND");
    const orButton = screen.getByLabelText("OR");

    expect(andButton).not.toBeChecked();
    expect(orButton).toBeChecked();
  });

  test("clicking on OR calls onChange with OR", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="AND"
        onChange={mockOnChange}
        label="Logical Operator"
      />,
    );

    const orButton = screen.getByText("OR");
    fireEvent.click(orButton);

    expect(mockOnChange).toHaveBeenCalledWith("OR");
  });

  test("clicking on AND calls onChange with AND", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="OR"
        onChange={mockOnChange}
        label="Logical Operator"
      />,
    );

    const andButton = screen.getByText("AND");
    fireEvent.click(andButton);

    expect(mockOnChange).toHaveBeenCalledWith("AND");
  });

  test("buttons are disabled when disabled prop is true", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="AND"
        onChange={mockOnChange}
        disabled={true}
        label="Logical Operator"
      />,
    );

    const andButton = screen.getByLabelText("AND");
    const orButton = screen.getByLabelText("OR");

    expect(andButton).toBeDisabled();
    expect(orButton).toBeDisabled();
  });

  test("AND button has primary variant", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="AND"
        onChange={mockOnChange}
        label="Logical Operator"
      />,
    );

    const andButton = screen.getByText("AND");
    expect(andButton).toHaveClass("btn-primary");
  });

  test("OR button has warning variant", () => {
    render(
      <LogicalOperatorSelector
        selectedOperator="OR"
        onChange={mockOnChange}
        label="Logical Operator"
      />,
    );

    const orButton = screen.getByText("OR");
    expect(orButton).toHaveClass("btn-warning");
  });
});
