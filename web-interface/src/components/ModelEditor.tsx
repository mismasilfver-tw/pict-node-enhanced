import React from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";

interface Parameter {
  key: string;
  values: any[];
}

interface Options {
  order?: number;
}

interface ModelEditorProps {
  model: Parameter[];
  onChange: (model: Parameter[]) => void;
  options: Options;
  onOptionsChange: (options: Options) => void;
}

const ModelEditor = ({
  model,
  onChange,
  options,
  onOptionsChange,
}: ModelEditorProps) => {
  const addParameter = () => {
    onChange([
      ...model,
      { key: `parameter${model.length + 1}`, values: ["value1"] },
    ]);
  };

  const removeParameter = (index: number) => {
    const newModel = [...model];
    newModel.splice(index, 1);
    onChange(newModel);
  };

  const updateParameterKey = (index: number, key: string) => {
    const newModel = [...model];
    newModel[index].key = key;
    onChange(newModel);
  };

  const addValue = (paramIndex: number) => {
    const newModel = [...model];
    newModel[paramIndex].values.push(
      `value${newModel[paramIndex].values.length + 1}`,
    );
    onChange(newModel);
  };

  const updateValue = (
    paramIndex: number,
    valueIndex: number,
    value: string,
  ) => {
    const newModel = [...model];

    // Try to parse the value as JSON if it starts with { or [
    let parsedValue: any = value;
    if (
      (value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]"))
    ) {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // If parsing fails, use the string value
        parsedValue = value;
      }
    } else if (value === "true" || value === "false") {
      // Handle boolean values
      parsedValue = value === "true";
    } else if (!isNaN(Number(value)) && value.trim() !== "") {
      // Handle numeric values
      parsedValue = Number(value);
    }

    newModel[paramIndex].values[valueIndex] = parsedValue;
    onChange(newModel);
  };

  const removeValue = (paramIndex: number, valueIndex: number) => {
    const newModel = [...model];
    newModel[paramIndex].values.splice(valueIndex, 1);
    onChange(newModel);
  };

  const handleOrderChange = (e: any) => {
    onOptionsChange({
      ...options,
      order: parseInt(e.target.value),
    });
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Combination Order</Form.Label>
        <Form.Select value={options.order} onChange={handleOrderChange}>
          <option value={2}>2-way (pairs)</option>
          <option value={3}>3-way (triplets)</option>
          <option value={4}>4-way (quadruplets)</option>
        </Form.Select>
        <Form.Text className="text-muted">
          Higher order means more test cases but better coverage
        </Form.Text>
      </Form.Group>

      <hr />

      <h5>Parameters</h5>

      {model.map((param, paramIndex) => (
        <Card className="parameter-row mb-3" key={paramIndex}>
          <Card.Body>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label htmlFor={`parameter-name-${paramIndex}`}>Parameter Name</Form.Label>
                  <Form.Control
                    id={`parameter-name-${paramIndex}`}
                    type="text"
                    value={param.key}
                    onChange={(e) =>
                      updateParameterKey(paramIndex, e.target.value)
                    }
                    placeholder="Parameter name"
                  />
                </Form.Group>
              </Col>
              <Col xs="auto" className="d-flex align-items-end">
                <Button
                  variant="outline-danger"
                  onClick={() => removeParameter(paramIndex)}
                  disabled={model.length <= 1}
                >
                  Remove
                </Button>
              </Col>
            </Row>

            <Form.Label>Values</Form.Label>
            {param.values.map((value, valueIndex) => (
              <Row className="mb-2" key={valueIndex}>
                <Col>
                  <Form.Control
                    type="text"
                    value={
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)
                    }
                    onChange={(e) =>
                      updateValue(paramIndex, valueIndex, e.target.value)
                    }
                    placeholder="Value"
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-danger"
                    onClick={() => removeValue(paramIndex, valueIndex)}
                    disabled={param.values.length <= 1}
                  >
                    &times;
                  </Button>
                </Col>
              </Row>
            ))}

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => addValue(paramIndex)}
              className="mt-2"
            >
              Add Value
            </Button>
          </Card.Body>
        </Card>
      ))}

      <Button variant="outline-primary" onClick={addParameter} className="mb-4">
        Add Parameter
      </Button>
    </div>
  );
};

export default ModelEditor;
