import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import ConditionBuilder, { Condition } from './ConditionBuilder';
import LogicalOperatorSelector, { LogicalOperator } from './LogicalOperatorSelector';

interface Parameter {
  key: string;
  values: any[];
}

interface ConstraintBuilderProps {
  parameters: Parameter[];
  onAddConstraint: (constraintText: string) => void;
  onCancel: () => void;
}

/**
 * Main constraint builder component that allows users to build constraints
 * using a guided UI with dropdowns instead of typing syntax
 */
const ConstraintBuilder = ({
  parameters,
  onAddConstraint,
  onCancel
}) => {
  // State for simple constraint
  const [simpleCondition, setSimpleCondition] = useState({
    parameterKey: null,
    operator: null,
    values: []
  } as Condition);

  // State for IF-THEN constraint
  const [ifCondition, setIfCondition] = useState({
    parameterKey: null,
    operator: null,
    values: []
  } as Condition);
  
  const [thenCondition, setThenCondition] = useState({
    parameterKey: null,
    operator: null,
    values: []
  } as Condition);

  // State for constraint type
  const [constraintType, setConstraintType] = useState('if-then' as 'simple' | 'if-then');
  
  // State for logical operator (for future multi-condition support)
  const [logicalOperator, setLogicalOperator] = useState('AND' as LogicalOperator);
  
  // Preview state
  const [constraintPreview, setConstraintPreview] = useState('');
  
  // Validation state
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Generate constraint preview whenever conditions change
  useEffect(() => {
    generatePreview();
  }, [simpleCondition, ifCondition, thenCondition, constraintType]);

  // Format a condition for display
  const formatCondition = (condition: Condition): string => {
    if (!condition.parameterKey || !condition.operator || condition.values.length === 0) {
      return '';
    }
    
    const param = parameters.find(p => p.key === condition.parameterKey);
    const isNumeric = param?.values.every(v => typeof v === 'number');
    
    const valueStr = condition.operator === 'IN' ?
      `{${condition.values.map(v => isNumeric ? v : `"${v}"`).join(', ')}}` :
      (isNumeric ? condition.values[0] : `"${condition.values[0]}"`);
    
    return `[${condition.parameterKey}] ${condition.operator} ${valueStr}`;
  };

  // Generate constraint preview
  const generatePreview = () => {
    let preview = '';
    let valid = false;
    
    if (constraintType === 'simple') {
      preview = formatCondition(simpleCondition);
      valid = Boolean(preview);
    } else {
      const ifPart = formatCondition(ifCondition);
      const thenPart = formatCondition(thenCondition);
      
      if (ifPart && thenPart) {
        preview = `IF ${ifPart} THEN ${thenPart}`;
        valid = true;
      }
    }
    
    if (preview) {
      preview += ';';
    }
    
    setConstraintPreview(preview);
    setIsValid(valid);
    setValidationMessage(valid ? 'Constraint is valid' : 'Please complete all fields');
  };

  // Handle constraint submission
  const handleAddConstraint = () => {
    if (isValid && constraintPreview) {
      onAddConstraint(constraintPreview);
      
      // Reset form fields after adding a constraint to prepare for the next one
      if (constraintType === 'simple') {
        setSimpleCondition({
          parameterKey: null,
          operator: null,
          values: []
        } as Condition);
      } else {
        setIfCondition({
          parameterKey: null,
          operator: null,
          values: []
        } as Condition);
        setThenCondition({
          parameterKey: null,
          operator: null,
          values: []
        } as Condition);
      }
      
      // Clear the preview
      setConstraintPreview('');
      setIsValid(false);
      setValidationMessage('');
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span>Build Constraint</span>
          <Form.Select 
            className="w-auto" 
            value={constraintType}
            onChange={(e) => setConstraintType(e.target.value as 'simple' | 'if-then')}
          >
            <option value="if-then">IF-THEN Constraint</option>
            <option value="simple">Simple Constraint</option>
          </Form.Select>
        </div>
      </Card.Header>
      <Card.Body>
        {constraintType === 'simple' ? (
          <Form.Group className="mb-4">
            <Form.Label><strong>Condition</strong></Form.Label>
            <ConditionBuilder
              parameters={parameters}
              condition={simpleCondition}
              onChange={setSimpleCondition}
              label=""
            />
          </Form.Group>
        ) : (
          <>
            <Form.Group className="mb-4">
              <Form.Label><strong>IF Condition</strong></Form.Label>
              <ConditionBuilder
                parameters={parameters}
                condition={ifCondition}
                onChange={setIfCondition}
                label=""
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label><strong>THEN Condition</strong></Form.Label>
              <ConditionBuilder
                parameters={parameters}
                condition={thenCondition}
                onChange={setThenCondition}
                label=""
              />
            </Form.Group>
          </>
        )}
        
        {/* For future multi-condition support */}
        {false && (
          <Row className="mb-3">
            <Col md={4}>
              <LogicalOperatorSelector
                selectedOperator={logicalOperator}
                onChange={setLogicalOperator}
                label="Combine with"
              />
            </Col>
          </Row>
        )}
        
        {constraintPreview && (
          <Alert variant={isValid ? "success" : "warning"} className="mt-3">
            <Alert.Heading>Constraint Preview</Alert.Heading>
            <code>{constraintPreview}</code>
            <p className="mt-2 mb-0">{validationMessage}</p>
          </Alert>
        )}
        
        <div className="d-flex justify-content-end mt-3">
          <Button 
            variant="secondary" 
            onClick={onCancel}
            className="me-2"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddConstraint}
            disabled={!isValid}
          >
            Add Constraint
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ConstraintBuilder;
