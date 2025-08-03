import React from 'react';
import { Form } from 'react-bootstrap';
import { OperatorType } from './OperatorDropdown';

interface Parameter {
  key: string;
  values: any[];
}

interface ValueDropdownProps {
  parameter: Parameter | null;
  selectedOperator: OperatorType | null;
  selectedValues: any[];
  onChange: (values: any[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * A dropdown component for selecting values based on the parameter and operator
 */
const ValueDropdown = ({
  parameter,
  selectedOperator,
  selectedValues,
  onChange,
  placeholder = 'Select value',
  label,
  disabled = false
}) => {
  // Determine if we're dealing with a multi-select (IN operator)
  const isMultiSelect = selectedOperator === 'IN';
  
  // Get available values from the parameter
  const availableValues = parameter?.values || [];
  
  // Determine if values are numeric
  const isNumeric = availableValues.length > 0 && 
    availableValues.every(val => typeof val === 'number');
  
  // Handle single value change
  const handleSingleValueChange = (e: any) => {
    const value = e.target.value;
    // Convert to number if the parameter has numeric values
    const processedValue = isNumeric ? Number(value) : value;
    onChange([processedValue]);
  };
  
  // Handle multi-select value change
  const handleMultiValueChange = (e: any) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const values = selectedOptions.map(option => {
      // Cast option to HTMLOptionElement to access value property safely
      const value = (option as HTMLOptionElement).value;
      // Convert to number if the parameter has numeric values
      return isNumeric ? Number(value) : value;
    });
    onChange(values);
  };
  
  // Format value for display
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    return String(value);
  };

  return (
    <div className="value-dropdown">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select
        value={isMultiSelect ? undefined : (selectedValues[0] !== undefined ? String(selectedValues[0]) : '')}
        onChange={isMultiSelect ? handleMultiValueChange : handleSingleValueChange}
        disabled={disabled || !parameter}
        aria-label="Value selection"
        multiple={isMultiSelect}
        className={isMultiSelect ? 'multi-select' : ''}
      >
        {!isMultiSelect && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {availableValues.map((value, index) => (
          <option 
            key={index} 
            value={formatValue(value)}
            selected={isMultiSelect && selectedValues.includes(value)}
          >
            {isNumeric ? value : `"${value}"`}
          </option>
        ))}
      </Form.Select>
      {isMultiSelect && (
        <Form.Text className="text-muted">
          Hold Ctrl (or Cmd on Mac) to select multiple values
        </Form.Text>
      )}
    </div>
  );
};

export default ValueDropdown;
