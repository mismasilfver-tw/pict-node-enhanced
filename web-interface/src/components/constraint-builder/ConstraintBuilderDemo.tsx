import React, { useState } from "react";
import { Card, Container, Row, Col, Button, Alert, Nav } from "react-bootstrap";
import ParameterDropdown from "./ParameterDropdown";
import OperatorDropdown, { OperatorType } from "./OperatorDropdown";
import ValueDropdown from "./ValueDropdown";
import ConditionBuilder, { Condition } from "./ConditionBuilder";
import ConstraintBuilder from "./ConstraintBuilder";
import LogicalOperatorSelector, {
  LogicalOperator,
} from "./LogicalOperatorSelector";
import ValidationDemo from "./ValidationDemo";

interface Parameter {
  key: string;
  values: any[];
}

/**
 * Demo component for the constraint builder UI components
 */
const ConstraintBuilderDemo = () => {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState("components");

  // Sample model data for testing
  const sampleParameters: Parameter[] = [
    { key: "fileSystem", values: ["FAT", "NTFS", "exFAT"] },
    { key: "size", values: [100, 1000, 10000] },
    { key: "compression", values: ["enabled", "disabled"] },
  ];

  // State for individual components
  const [selectedParameter, setSelectedParameter] = useState(
    null as string | null,
  );
  const [selectedOperator, setSelectedOperator] = useState(
    null as OperatorType | null,
  );
  const [selectedValues, setSelectedValues] = useState([] as any[]);

  // State for ConditionBuilder
  const [condition, setCondition] = useState({
    parameterKey: null,
    operator: null,
    values: [],
  } as Condition);

  // State for IF-THEN condition
  const [ifCondition, setIfCondition] = useState({
    parameterKey: null,
    operator: null,
    values: [],
  } as Condition);

  const [thenCondition, setThenCondition] = useState({
    parameterKey: null,
    operator: null,
    values: [],
  } as Condition);

  // Preview state
  const [constraintPreview, setConstraintPreview] = useState("");

  // State for LogicalOperatorSelector test
  const [logicalOperator, setLogicalOperator] = useState(
    "AND" as LogicalOperator,
  );

  // State for added constraints
  const [addedConstraints, setAddedConstraints] = useState([] as string[]);

  // Handlers for individual components
  const handleParameterChange = (paramKey: string | null) => {
    setSelectedParameter(paramKey);
    setSelectedOperator(null);
    setSelectedValues([]);
  };

  const handleOperatorChange = (operator: OperatorType | null) => {
    setSelectedOperator(operator);
    setSelectedValues([]);
  };

  const handleValueChange = (values: any[]) => {
    setSelectedValues(values);
  };

  // Handler for ConditionBuilder
  const handleConditionChange = (updatedCondition: Condition) => {
    setCondition(updatedCondition);
  };

  // Handlers for IF-THEN condition
  const handleIfConditionChange = (updatedCondition: Condition) => {
    setIfCondition(updatedCondition);
  };

  const handleThenConditionChange = (updatedCondition: Condition) => {
    setThenCondition(updatedCondition);
  };

  // Handler for LogicalOperatorSelector
  const handleLogicalOperatorChange = (operator: LogicalOperator) => {
    setLogicalOperator(operator);
  };

  // Handler for adding constraints
  const handleAddConstraint = (constraintString: string) => {
    setAddedConstraints([...addedConstraints, constraintString]);
  };

  // Helper function to generate preview string
  const generatePreview = () => {
    // Simple condition preview
    if (condition.parameterKey && condition.operator) {
      let preview = "";

      // Format values based on type
      const formattedValues = condition.values.map((value) => {
        if (typeof value === "string") {
          return `"${value}"`;
        }
        return value;
      });

      // Format based on operator
      if (condition.operator === "IN") {
        preview = `${condition.parameterKey} ${condition.operator} {${formattedValues.join(", ")}}`;
      } else {
        preview = `${condition.parameterKey} ${condition.operator} ${formattedValues.join(", ")}`;
      }

      setConstraintPreview(preview);
    }
  };

  return (
    <Container>
      <h2 className="mt-4 mb-4">Constraint Builder UI Tests</h2>

      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            active={activeTab === "components"}
            onClick={() => setActiveTab("components")}
          >
            Component Tests
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === "validation"}
            onClick={() => setActiveTab("validation")}
          >
            Validation Demo
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === "validation" ? (
        <ValidationDemo />
      ) : (
        <>
          <Card className="mt-4 mb-4">
            <Card.Header>Individual Component Tests</Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={4}>
                  <h5>Parameter Dropdown</h5>
                  <ParameterDropdown
                    parameters={sampleParameters}
                    selectedParameter={selectedParameter}
                    onChange={handleParameterChange}
                    label="Select parameter"
                  />

                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Selected Parameter:</h6>
                    <code>{selectedParameter || "None"}</code>
                  </div>
                </Col>

                <Col md={4}>
                  <h5>Operator Dropdown</h5>
                  <OperatorDropdown
                    selectedOperator={selectedOperator}
                    onChange={handleOperatorChange}
                    isNumeric={selectedParameter === "size"}
                    disabled={!selectedParameter}
                    label="Select operator"
                  />

                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Selected Operator:</h6>
                    <code>{selectedOperator || "None"}</code>
                  </div>
                </Col>

                <Col md={4}>
                  <h5>Value Dropdown</h5>
                  <ValueDropdown
                    parameter={sampleParameters.find(
                      (p) => p.key === selectedParameter,
                    )}
                    selectedOperator={selectedOperator}
                    selectedValues={selectedValues}
                    onChange={handleValueChange}
                    disabled={!selectedParameter || !selectedOperator}
                    label="Select value(s)"
                  />

                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Selected Values:</h6>
                    <code>
                      {selectedValues.length > 0
                        ? JSON.stringify(selectedValues)
                        : "None"}
                    </code>
                  </div>
                </Col>
              </Row>

              <hr />

              <Row className="mb-4">
                <Col md={6}>
                  <h5>Condition Builder</h5>
                  <ConditionBuilder
                    parameters={sampleParameters}
                    condition={condition}
                    onChange={handleConditionChange}
                    label="Build a condition"
                  />

                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Condition State:</h6>
                    <code>{JSON.stringify(condition)}</code>

                    <div className="mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={generatePreview}
                      >
                        Generate Preview
                      </Button>
                    </div>

                    {constraintPreview && (
                      <div className="mt-2">
                        <h6>Preview:</h6>
                        <Alert variant="info">
                          <code>{constraintPreview}</code>
                        </Alert>
                      </div>
                    )}
                  </div>
                </Col>

                <Col md={6}>
                  <h5>IF-THEN Condition Builder</h5>
                  <Card>
                    <Card.Body>
                      <h6>IF Condition:</h6>
                      <ConditionBuilder
                        parameters={sampleParameters}
                        condition={ifCondition}
                        onChange={handleIfConditionChange}
                        label="IF condition"
                      />

                      <h6 className="mt-3">THEN Condition:</h6>
                      <ConditionBuilder
                        parameters={sampleParameters}
                        condition={thenCondition}
                        onChange={handleThenConditionChange}
                        label="THEN condition"
                      />

                      <div className="mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            if (
                              ifCondition.parameterKey &&
                              ifCondition.operator &&
                              thenCondition.parameterKey &&
                              thenCondition.operator
                            ) {
                              // Format values
                              const formatValue = (value: any) => {
                                return typeof value === "string"
                                  ? `"${value}"`
                                  : value;
                              };

                              const ifValues = ifCondition.values
                                .map(formatValue)
                                .join(", ");
                              const thenValues = thenCondition.values
                                .map(formatValue)
                                .join(", ");

                              // Create preview
                              const ifPart = `${ifCondition.parameterKey} ${ifCondition.operator} ${ifValues}`;
                              const thenPart = `${thenCondition.parameterKey} ${thenCondition.operator} ${thenValues}`;

                              setConstraintPreview(
                                `IF ${ifPart} THEN ${thenPart}`,
                              );
                            }
                          }}
                        >
                          Generate IF-THEN Preview
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <hr />

              <Row className="mb-4">
                <Col md={6}>
                  <h5>Logical Operator Selector</h5>
                  <LogicalOperatorSelector
                    selectedOperator={logicalOperator}
                    onChange={handleLogicalOperatorChange}
                    label="Select logical operator"
                  />

                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Selected Operator:</h6>
                    <code>{logicalOperator}</code>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Complete Constraint Builder</Card.Header>
            <Card.Body>
              <ConstraintBuilder
                parameters={sampleParameters}
                onAddConstraint={handleAddConstraint}
                onCancel={() => {}}
              />

              {addedConstraints.length > 0 && (
                <div className="mt-4">
                  <h5>Added Constraints:</h5>
                  <ul className="list-group">
                    {addedConstraints.map((constraint, index) => (
                      <li key={index} className="list-group-item">
                        <code>{constraint}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ConstraintBuilderDemo;
