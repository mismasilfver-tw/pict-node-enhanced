import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import OperatorDropdown, { OperatorType } from "./OperatorDropdown";

describe("OperatorDropdown", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test("renders with default placeholder", () => {
    render(
      <OperatorDropdown
        selectedOperator={null}
        onChange={mockOnChange}
        isNumeric={false}
        label="Operator"
      />,
    );

    expect(screen.getByText("Select operator")).toBeInTheDocument();
  });

  test("renders with custom placeholder", () => {
    render(
      <OperatorDropdown
        selectedOperator={null}
        onChange={mockOnChange}
        isNumeric={false}
        placeholder="Custom operator placeholder"
        label="Operator"
      />,
    );

    expect(screen.getByText("Custom operator placeholder")).toBeInTheDocument();
  });

  test("renders with label when provided", () => {
    render(
      <OperatorDropdown
        selectedOperator={null}
        onChange={mockOnChange}
        isNumeric={false}
        label="Operator Label"
      />,
    );

    expect(screen.getByText("Operator Label")).toBeInTheDocument();
  });

  test("renders basic operators for non-numeric parameters", () => {
    render(
      <OperatorDropdown
        selectedOperator={null}
        onChange={mockOnChange}
        isNumeric={false}
        label="Operator"
      />,
    );

    expect(screen.getByText("equals (=)")).toBeInTheDocument();
    expect(screen.getByText("not equals (<>)")).toBeInTheDocument();
    expect(screen.getByText("in list (IN)")).toBeInTheDocument();

    // Should not render numeric operators
    expect(screen.queryByText("less than (<)")).not.toBeInTheDocument();
    expect(screen.queryByText("greater than (>)")).not.toBeInTheDocument();
    expect(
      screen.queryByText("less than or equal (<=)"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("greater than or equal (>=)"),
    ).not.toBeInTheDocument();
  });

  test("renders all operators for numeric parameters", () => {
    render(
      <OperatorDropdown
        selectedOperator={null}
        onChange={mockOnChange}
        isNumeric={true}
        label="Operator"
      />,
    );

    // Basic operators
    expect(screen.getByText("equals (=)")).toBeInTheDocument();
    expect(screen.getByText("not equals (<>)")).toBeInTheDocument();
    expect(screen.getByText("in list (IN)")).toBeInTheDocument();

    // Numeric operators
    expect(screen.getByText("less than (<)")).toBeInTheDocument();
    expect(screen.getByText("greater than (>)")).toBeInTheDocument();
    expect(screen.getByText("less than or equal (<=)")).toBeInTheDocument();
    expect(screen.getByText("greater than or equal (>=)")).toBeInTheDocument();
  });

  test("selects operator when changed", () => {
    render(
      <OperatorDropdown
        selectedOperator={null}
        onChange={mockOnChange}
        isNumeric={true}
        label="Operator"
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: ">" } });
    expect(mockOnChange).toHaveBeenCalledWith(">");
  });

  test("displays selected operator", () => {
    render(
      <OperatorDropdown
        selectedOperator={"="}
        onChange={mockOnChange}
        isNumeric={false}
        label="Operator"
      />,
    );

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    expect(selectElement.value).toBe("=");
  });

  test("is disabled when disabled prop is true", () => {
    render(
      <OperatorDropdown
        selectedOperator={null}
        onChange={mockOnChange}
        isNumeric={false}
        disabled={true}
        label="Operator"
      />,
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
