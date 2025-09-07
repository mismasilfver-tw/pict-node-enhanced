import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import ParameterDropdown from "./ParameterDropdown";
import OperatorDropdown, { OperatorType } from "./OperatorDropdown";
import ValueDropdown from "./ValueDropdown";

interface Parameter {
  key: string;
  values: any[];
}

export interface Condition {
  parameterKey: string | null;
  operator: OperatorType | null;
  values: any[];
}

interface ConditionBuilderProps {
  parameters: Parameter[];
  condition: Condition;
  onChange: (condition: Condition) => void;
  label?: string; // Make label optional
}

/**
 * A component that combines parameter, operator, and value selection
 * for building a single condition in a constraint
 */
const ConditionBuilder = ({
  parameters,
  condition,
  onChange,
  label,
}: ConditionBuilderProps) => {
  const [selectedParameter, setSelectedParameter] = useState(
    null as Parameter | null,
  );

  // Update selected parameter when condition changes
  useEffect(() => {
    if (condition.parameterKey) {
      const param = parameters.find((p) => p.key === condition.parameterKey);
      setSelectedParameter(param || null);
    } else {
      setSelectedParameter(null);
    }
  }, [condition.parameterKey, parameters]);

  // Check if parameter values are numeric
  const isNumeric = selectedParameter?.values.length
    ? selectedParameter.values.every((val) => typeof val === "number")
    : false;

  // Handle parameter selection
  const handleParameterChange = (paramKey: string) => {
    const updatedCondition = {
      ...condition,
      parameterKey: paramKey,
      // Reset values when parameter changes
      values: [],
    };
    onChange(updatedCondition);
  };

  // Handle operator selection
  const handleOperatorChange = (operator: OperatorType) => {
    const updatedCondition = {
      ...condition,
      operator,
      // Reset values when operator changes (especially for IN operator)
      values: operator === "IN" ? [] : condition.values,
    };
    onChange(updatedCondition);
  };

  // Handle value selection
  const handleValueChange = (values: any[]) => {
    const updatedCondition = {
      ...condition,
      values,
    };
    onChange(updatedCondition);
  };

  return (
    <div className="condition-builder">
      {label && <div className="condition-label mb-2">{label}</div>}
      <Row className="align-items-end g-2">
        <Col xs={12} md={4}>
          <ParameterDropdown
            parameters={parameters}
            selectedParameter={condition.parameterKey}
            onChange={handleParameterChange}
            placeholder="Select parameter"
            label=""
          />
        </Col>
        <Col xs={12} md={3}>
          <OperatorDropdown
            selectedOperator={condition.operator}
            onChange={handleOperatorChange}
            isNumeric={isNumeric}
            disabled={!condition.parameterKey}
            placeholder="Select operator"
            label=""
          />
        </Col>
        <Col xs={12} md={5}>
          <ValueDropdown
            parameter={selectedParameter}
            selectedOperator={condition.operator}
            selectedValues={condition.values}
            onChange={handleValueChange}
            disabled={!condition.parameterKey || !condition.operator}
            placeholder="Select value"
            label=""
          />
        </Col>
      </Row>
    </div>
  );
};

export default ConditionBuilder;
