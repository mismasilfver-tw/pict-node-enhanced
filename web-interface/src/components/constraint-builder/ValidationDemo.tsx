import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Form, Alert } from "react-bootstrap";
import ParameterDropdown from "./ParameterDropdown";
import OperatorDropdown, { OperatorType } from "./OperatorDropdown";
import ValueDropdown from "./ValueDropdown";
import ConditionBuilder, { Condition } from "./ConditionBuilder";

interface Parameter {
  key: string;
  values: any[];
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: "success" | "warning" | "danger";
}

/**
 * Component for demonstrating validation scenarios in the constraint builder UI
 */
const ValidationDemo = () => {
  // Sample model data for testing with more diverse types
  const sampleParameters: Parameter[] = [
    { key: "fileSystem", values: ["FAT", "NTFS", "exFAT"] },
    { key: "size", values: [100, 1000, 10000] },
    { key: "compression", values: ["enabled", "disabled"] },
    { key: "emptyParam", values: [] }, // Parameter with no values for testing
    { key: "mixedTypes", values: ["string", 42, true] }, // Parameter with mixed types for testing
  ];

  // State for invalid combination test
  const [invalidComboParam, setInvalidComboParam] = useState(
    null as string | null,
  );
  const [invalidComboOperator, setInvalidComboOperator] = useState(
    null as OperatorType | null,
  );
  const [invalidComboValidation, setInvalidComboValidation] = useState({
    isValid: true,
    message: "",
    type: "success",
  } as ValidationResult);

  // State for type mismatch test
  const [typeMismatchCondition, setTypeMismatchCondition] = useState({
    parameterKey: null,
    operator: null,
    values: [],
  } as Condition);
  const [typeMismatchValidation, setTypeMismatchValidation] = useState({
    isValid: true,
    message: "",
    type: "success",
  } as ValidationResult);

  // State for syntax validation test
  const [syntaxCondition, setSyntaxCondition] = useState({
    parameterKey: null,
    operator: null,
    values: [],
  } as Condition);
  const [syntaxValidation, setSyntaxValidation] = useState({
    isValid: true,
    message: "",
    type: "success",
  } as ValidationResult);
  const [syntaxPreview, setSyntaxPreview] = useState("");

  // Validate invalid parameter-operator combinations
  useEffect(() => {
    if (invalidComboParam && invalidComboOperator) {
      const param = sampleParameters.find((p) => p.key === invalidComboParam);

      // Case 1: Empty parameter values with IN operator
      if (param?.values.length === 0 && invalidComboOperator === "IN") {
        setInvalidComboValidation({
          isValid: false,
          message: "Cannot use IN operator with a parameter that has no values",
          type: "danger",
        });
        return;
      }

      // Case 2: String parameter with numeric operators
      const isNumeric = param?.values.every((v) => typeof v === "number");
      const numericOperators: OperatorType[] = ["<", ">", "<=", ">="];

      if (!isNumeric && numericOperators.includes(invalidComboOperator)) {
        setInvalidComboValidation({
          isValid: false,
          message: `Cannot use ${invalidComboOperator} operator with non-numeric parameter`,
          type: "danger",
        });
        return;
      }

      // Valid combination
      setInvalidComboValidation({
        isValid: true,
        message: "Valid parameter-operator combination",
        type: "success",
      });
    }
  }, [invalidComboParam, invalidComboOperator]);

  // Validate type mismatches between parameters and values
  useEffect(() => {
    if (
      typeMismatchCondition.parameterKey &&
      typeMismatchCondition.operator &&
      typeMismatchCondition.values.length > 0
    ) {
      const param = sampleParameters.find(
        (p) => p.key === typeMismatchCondition.parameterKey,
      );

      // Check for mixed types in parameter values
      if (param?.key === "mixedTypes") {
        const valueTypes = typeMismatchCondition.values.map((v) => typeof v);
        // Create array of unique types without using Set spread
        const uniqueTypes = Array.from(new Set(valueTypes));

        if (uniqueTypes.length > 1) {
          setTypeMismatchValidation({
            isValid: false,
            message: "Selected values have inconsistent types",
            type: "warning",
          });
          return;
        }
      }

      // Check for numeric operators with non-numeric values
      const numericOperators: OperatorType[] = ["<", ">", "<=", ">="];
      if (numericOperators.includes(typeMismatchCondition.operator)) {
        const allNumeric = typeMismatchCondition.values.every(
          (v) => typeof v === "number" || !isNaN(Number(v)),
        );

        if (!allNumeric) {
          setTypeMismatchValidation({
            isValid: false,
            message: `Operator ${typeMismatchCondition.operator} requires numeric values`,
            type: "danger",
          });
          return;
        }
      }

      // Valid types
      setTypeMismatchValidation({
        isValid: true,
        message: "Parameter and value types are compatible",
        type: "success",
      });
    }
  }, [typeMismatchCondition]);

  // Validate syntax for generated constraints
  useEffect(() => {
    if (
      syntaxCondition.parameterKey &&
      syntaxCondition.operator &&
      syntaxCondition.values.length > 0
    ) {
      const param = sampleParameters.find(
        (p) => p.key === syntaxCondition.parameterKey,
      );
      const isNumeric = param?.values.every((v) => typeof v === "number");

      try {
        // Generate constraint syntax
        let valueStr = "";
        if (syntaxCondition.operator === "IN") {
          valueStr = `{${syntaxCondition.values.map((v) => (isNumeric ? v : `"${v}"`)).join(", ")}}`;
        } else {
          valueStr = isNumeric
            ? syntaxCondition.values[0]
            : `"${syntaxCondition.values[0]}"`;
        }

        const constraintSyntax = `[${syntaxCondition.parameterKey}] ${syntaxCondition.operator} ${valueStr};`;
        setSyntaxPreview(constraintSyntax);

        // Validate syntax
        // Check for special characters in parameter names
        if (
          syntaxCondition.parameterKey.includes(" ") ||
          syntaxCondition.parameterKey.includes('"') ||
          syntaxCondition.parameterKey.includes("'")
        ) {
          setSyntaxValidation({
            isValid: false,
            message: "Parameter name contains invalid characters",
            type: "danger",
          });
          return;
        }

        // Check for proper quoting of string values
        if (!isNumeric && syntaxCondition.operator !== "IN") {
          if (!valueStr.startsWith('"') || !valueStr.endsWith('"')) {
            setSyntaxValidation({
              isValid: false,
              message: "String values must be properly quoted",
              type: "danger",
            });
            return;
          }
        }

        // Check for proper formatting of IN values
        if (syntaxCondition.operator === "IN") {
          if (!valueStr.startsWith("{") || !valueStr.endsWith("}")) {
            setSyntaxValidation({
              isValid: false,
              message: "IN operator values must be enclosed in curly braces",
              type: "danger",
            });
            return;
          }
        }

        // Valid syntax
        setSyntaxValidation({
          isValid: true,
          message: "Constraint syntax is valid",
          type: "success",
        });
      } catch (error) {
        setSyntaxValidation({
          isValid: false,
          message: `Syntax error: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "danger",
        });
      }
    }
  }, [syntaxCondition]);

  return (
    <Container>
      <h2 className="mt-4 mb-4">Validation Tests</h2>

      <Card className="mb-4" data-testid="invalid-combo-card">
        <Card.Header>Invalid Parameter-Operator Combinations</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Parameter</Form.Label>
                <ParameterDropdown
                  parameters={sampleParameters}
                  selectedParameter={invalidComboParam}
                  onChange={setInvalidComboParam}
                  label=""
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Operator</Form.Label>
                <OperatorDropdown
                  selectedOperator={invalidComboOperator}
                  onChange={setInvalidComboOperator}
                  isNumeric={false}
                  disabled={!invalidComboParam}
                  label=""
                />
              </Form.Group>
            </Col>
          </Row>

          {invalidComboParam && invalidComboOperator && (
            <Alert variant={invalidComboValidation.type}>
              <strong>Validation Result:</strong>{" "}
              {invalidComboValidation.message}
            </Alert>
          )}

          <div className="mt-3">
            <h6>Test Cases:</h6>
            <ul>
              <li>Select 'emptyParam' and 'IN' operator - should show error</li>
              <li>
                Select 'fileSystem' and {">"} operator - should show error
              </li>
              <li>Select 'size' and '=' operator - should be valid</li>
            </ul>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4" data-testid="type-mismatch-card">
        <Card.Header>Type Mismatch Tests</Card.Header>
        <Card.Body>
          <ConditionBuilder
            parameters={sampleParameters}
            condition={typeMismatchCondition}
            onChange={setTypeMismatchCondition}
            label="Build a condition to test type validation"
          />

          {typeMismatchCondition.parameterKey &&
            typeMismatchCondition.operator &&
            typeMismatchCondition.values.length > 0 && (
              <Alert variant={typeMismatchValidation.type} className="mt-3">
                <strong>Type Validation:</strong>{" "}
                {typeMismatchValidation.message}
              </Alert>
            )}

          <div className="mt-3">
            <h6>Test Cases:</h6>
            <ul>
              <li>
                Select 'mixedTypes' parameter - should warn about inconsistent
                types
              </li>
              <li>
                Select 'size' parameter with {">"} operator and select a
                non-numeric value - should show error
              </li>
              <li>Select 'fileSystem' with '=' operator - should be valid</li>
            </ul>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4" data-testid="syntax-demo-card">
        <Card.Header>Syntax Validation Demo</Card.Header>
        <Card.Body>
          <ConditionBuilder
            parameters={sampleParameters}
            condition={syntaxCondition}
            onChange={setSyntaxCondition}
            label="Build a condition to test syntax validation"
          />

          {syntaxPreview && (
            <div className="mt-3">
              <h6>Generated Syntax:</h6>
              <code>{syntaxPreview}</code>

              <Alert variant={syntaxValidation.type} className="mt-2">
                <strong>Syntax Validation:</strong> {syntaxValidation.message}
              </Alert>
            </div>
          )}

          <div className="mt-3">
            <h6>Test Cases:</h6>
            <ul>
              <li>Any complete condition should generate valid PICT syntax</li>
              <li>String values should be properly quoted</li>
              <li>IN operator values should be enclosed in curly braces</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ValidationDemo;
