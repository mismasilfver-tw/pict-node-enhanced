import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

interface ConstraintsEditorProps {
  model: any[];
  constraints: string[];
  onChange: (constraints: string[]) => void;
}

const ConstraintsEditor = ({ model, constraints, onChange }: ConstraintsEditorProps) => {
  const [newConstraint, setNewConstraint] = useState('');
  const [error, setError] = useState('');

  const addConstraint = () => {
    if (!newConstraint.trim()) {
      setError('Constraint cannot be empty');
      return;
    }

    // Basic validation - check if the constraint contains parameter names
    const isValid = model.some(param => 
      newConstraint.includes(`[${param.key}]`)
    );

    if (!isValid) {
      setError('Constraint should reference at least one parameter using [parameter_name] syntax');
      return;
    }

    setError('');
    onChange([...constraints, newConstraint.trim()]);
    setNewConstraint('');
  };

  const removeConstraint = (index: number) => {
    const updatedConstraints = [...constraints];
    updatedConstraints.splice(index, 1);
    onChange(updatedConstraints);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addConstraint();
    }
  };

  // Generate parameter hints
  const generateHint = () => {
    if (model.length === 0) return '';
    
    const exampleParam = model[0].key;
    const exampleValues = model[0].values.slice(0, 2).map(v => 
      typeof v === 'object' ? JSON.stringify(v) : String(v)
    );
    
    return `Example: IF [${exampleParam}] = "${exampleValues[0]}" THEN [${model.length > 1 ? model[1].key : exampleParam}] <> "${exampleValues.length > 1 ? exampleValues[1] : exampleValues[0]}";`;
  };

  return (
    <Card className="mb-4">
      <Card.Header>Constraints</Card.Header>
      <Card.Body>
        <p className="text-muted">
          Constraints allow you to define rules that restrict certain combinations.
          Use syntax like: IF [parameter1] = "value1" THEN [parameter2] &lt;&gt; "value2";
        </p>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form.Group className="mb-3">
          <Form.Label>Add Constraint</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newConstraint}
            onChange={(e) => setNewConstraint(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={generateHint()}
          />
          <Form.Text className="text-muted">
            Press Enter to add or use the Add button. Use [parameter_name] to reference parameters.
          </Form.Text>
        </Form.Group>
        
        <Button variant="outline-primary" onClick={addConstraint} className="mb-3">
          Add Constraint
        </Button>
        
        {constraints.length > 0 && (
          <div className="mt-3">
            <h6>Current Constraints:</h6>
            <ul className="list-group">
              {constraints.map((constraint, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <code>{constraint}</code>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeConstraint(index)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4">
          <h6>Constraint Syntax Help:</h6>
          <ul className="text-muted">
            <li><code>IF [param] = "value" THEN [param2] = "value2";</code> - If-Then condition</li>
            <li><code>[param] &lt;&gt; "value";</code> - Parameter cannot equal value</li>
            <li><code>[param] IN &#123;"value1", "value2"&#125;;</code> - Parameter must be one of the values</li>
            <li><code>[param1] = "value1" AND [param2] = "value2";</code> - Logical AND</li>
            <li><code>[param1] = "value1" OR [param2] = "value2";</code> - Logical OR</li>
            <li><code>IF [param] &gt; 5 THEN [param2] &lt; 10;</code> - Numeric comparisons</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ConstraintsEditor;
