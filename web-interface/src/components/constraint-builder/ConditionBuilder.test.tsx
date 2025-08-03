import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConditionBuilder, { Condition } from './ConditionBuilder';

describe('ConditionBuilder', () => {
  const mockParameters = [
    { key: 'fileSystem', values: ['FAT', 'NTFS', 'exFAT'] },
    { key: 'size', values: [100, 1000, 10000] },
    { key: 'compression', values: ['enabled', 'disabled'] },
  ];
  
  const mockOnChange = jest.fn();
  
  const initialCondition: Condition = {
    parameterKey: null,
    operator: null,
    values: []
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders all three dropdowns', () => {
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={initialCondition}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    // Should have three dropdowns (parameter, operator, value)
    expect(screen.getAllByRole('combobox').length).toBe(3);
  });

  test('renders with label when provided', () => {
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={initialCondition}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    expect(screen.getByText('Test Condition')).toBeInTheDocument();
  });

  test('operator and value dropdowns are disabled initially', () => {
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={initialCondition}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    const dropdowns = screen.getAllByRole('combobox');
    // First dropdown (parameter) should be enabled
    expect(dropdowns[0]).not.toBeDisabled();
    // Second dropdown (operator) should be disabled
    expect(dropdowns[1]).toBeDisabled();
    // Third dropdown (value) should be disabled
    expect(dropdowns[2]).toBeDisabled();
  });

  test('selecting a parameter enables the operator dropdown', () => {
    const conditionWithParameter: Condition = {
      parameterKey: 'fileSystem',
      operator: null,
      values: []
    };
    
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={conditionWithParameter}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    const dropdowns = screen.getAllByRole('combobox');
    // Operator dropdown should be enabled
    expect(dropdowns[1]).not.toBeDisabled();
    // Value dropdown should still be disabled
    expect(dropdowns[2]).toBeDisabled();
  });

  test('selecting an operator enables the value dropdown', () => {
    const conditionWithOperator: Condition = {
      parameterKey: 'fileSystem',
      operator: '=',
      values: []
    };
    
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={conditionWithOperator}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    const dropdowns = screen.getAllByRole('combobox');
    // Value dropdown should be enabled
    expect(dropdowns[2]).not.toBeDisabled();
  });

  test('changing parameter calls onChange with updated condition', () => {
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={initialCondition}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    // Select the first parameter
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'fileSystem' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      parameterKey: 'fileSystem',
      operator: null,
      values: []
    });
  });

  test('changing operator calls onChange with updated condition', () => {
    const conditionWithParameter: Condition = {
      parameterKey: 'fileSystem',
      operator: null,
      values: []
    };
    
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={conditionWithParameter}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    // Select an operator
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '=' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      parameterKey: 'fileSystem',
      operator: '=',
      values: []
    });
  });

  test('changing value calls onChange with updated condition', () => {
    const conditionWithOperator: Condition = {
      parameterKey: 'fileSystem',
      operator: '=',
      values: []
    };
    
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={conditionWithOperator}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    // Select a value
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'NTFS' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      parameterKey: 'fileSystem',
      operator: '=',
      values: ['NTFS']
    });
  });

  test('displays the correct operators for numeric parameter', () => {
    const conditionWithNumericParameter: Condition = {
      parameterKey: 'size',
      operator: null,
      values: []
    };
    
    render(
      <ConditionBuilder
        parameters={mockParameters}
        condition={conditionWithNumericParameter}
        onChange={mockOnChange}
        label="Test Condition"
      />
    );
    
    // Open the operator dropdown
    const operatorDropdown = screen.getAllByRole('combobox')[1];
    fireEvent.click(operatorDropdown);
    
    // Should have numeric operators (=, <>, >, <, >=, <=)
    expect(screen.getByText('equals (=)')).toBeInTheDocument();
    expect(screen.getByText('not equals (<>)')).toBeInTheDocument();
    expect(screen.getByText('greater than (>)')).toBeInTheDocument();
    expect(screen.getByText('less than (<)')).toBeInTheDocument();
  });
});
