import React from "react";
import { Form } from "react-bootstrap";

// Define the available operators for different parameter types
export type OperatorType = "=" | "<>" | "<" | ">" | "<=" | ">=" | "IN";

interface OperatorDropdownProps {
  selectedOperator: OperatorType | null;
  onChange: (operator: OperatorType) => void;
  isNumeric: boolean; // Whether the parameter has numeric values
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * A dropdown component for selecting operators based on parameter type
 */
const OperatorDropdown = ({
  selectedOperator,
  onChange,
  isNumeric,
  placeholder = "Select operator",
  label,
  disabled = false,
}) => {
  // Define operators based on parameter type
  const operators: { value: OperatorType; label: string }[] = [
    { value: "=", label: "equals (=)" },
    { value: "<>", label: "not equals (<>)" },
    { value: "IN", label: "in list (IN)" },
  ];

  // Add numeric operators if the parameter has numeric values
  if (isNumeric) {
    operators.push(
      { value: "<", label: "less than (<)" },
      { value: ">", label: "greater than (>)" },
      { value: "<=", label: "less than or equal (<=)" },
      { value: ">=", label: "greater than or equal (>=)" },
    );
  }

  return (
    <div className="operator-dropdown">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select
        value={selectedOperator || ""}
        onChange={(e) => onChange(e.target.value as OperatorType)}
        disabled={disabled}
        aria-label="Operator selection"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default OperatorDropdown;
