import React from 'react';
import { Form } from 'react-bootstrap';

interface Parameter {
  key: string;
  values: any[];
}

interface ParameterDropdownProps {
  parameters: Parameter[];
  selectedParameter: string | null;
  onChange: (parameterKey: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * A dropdown component for selecting parameters from the model
 */
const ParameterDropdown = ({
  parameters,
  selectedParameter,
  onChange,
  placeholder = 'Select parameter',
  label,
  disabled = false
}) => {
  return (
    <div className="parameter-dropdown">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select
        value={selectedParameter || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Parameter selection"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {parameters.map((param) => (
          <option key={param.key} value={param.key}>
            {param.key}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default ParameterDropdown;
