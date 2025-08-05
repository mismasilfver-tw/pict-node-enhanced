import React from "react";
import { Form, ButtonGroup, ToggleButton } from "react-bootstrap";

export type LogicalOperator = "AND" | "OR";

interface LogicalOperatorSelectorProps {
  selectedOperator: LogicalOperator;
  onChange: (operator: LogicalOperator) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * A component for selecting logical operators (AND/OR) to combine conditions
 */
const LogicalOperatorSelector = ({
  selectedOperator,
  onChange,
  disabled = false,
  label,
}) => {
  const operators: { value: LogicalOperator; label: string }[] = [
    { value: "AND", label: "AND" },
    { value: "OR", label: "OR" },
  ];

  return (
    <div className="logical-operator-selector">
      {label && <Form.Label>{label}</Form.Label>}
      <ButtonGroup className="w-100">
        {operators.map((op) => (
          <ToggleButton
            key={op.value}
            id={`operator-${op.value}`}
            type="radio"
            variant={op.value === "AND" ? "primary" : "warning"}
            name="logical-operator"
            value={op.value}
            checked={selectedOperator === op.value}
            onChange={(e) => onChange(e.currentTarget.value as LogicalOperator)}
            disabled={disabled}
          >
            {op.label}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default LogicalOperatorSelector;
