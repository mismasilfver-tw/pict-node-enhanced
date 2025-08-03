import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ValueDropdown from './ValueDropdown';
import { OperatorType } from './OperatorDropdown';

describe('ValueDropdown', () => {
  const mockStringParameter = {
    key: 'fileSystem',
    values: ['FAT', 'NTFS', 'exFAT']
  };
  
  const mockNumericParameter = {
    key: 'size',
    values: [100, 1000, 10000]
  };
  
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders with default placeholder for single select', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Select value')).toBeInTheDocument();
  });

  test('renders with custom placeholder', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
        placeholder="Custom value placeholder"
      />
    );
    
    expect(screen.getByText('Custom value placeholder')).toBeInTheDocument();
  });

  test('renders with label when provided', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
        label="Value Label"
      />
    );
    
    expect(screen.getByText('Value Label')).toBeInTheDocument();
  });

  test('renders string values with quotes', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('"FAT"')).toBeInTheDocument();
    expect(screen.getByText('"NTFS"')).toBeInTheDocument();
    expect(screen.getByText('"exFAT"')).toBeInTheDocument();
  });

  test('renders numeric values without quotes', () => {
    render(
      <ValueDropdown
        parameter={mockNumericParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  test('shows multi-select for IN operator', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'IN'}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    const selectElement = screen.getByRole('listbox');
    expect(selectElement).toHaveAttribute('multiple');
    expect(screen.getByText('Hold Ctrl (or Cmd on Mac) to select multiple values')).toBeInTheDocument();
  });

  test('does not show multi-select for other operators', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).not.toHaveAttribute('multiple');
    expect(screen.queryByText('Hold Ctrl (or Cmd on Mac) to select multiple values')).not.toBeInTheDocument();
  });

  test('selects single value when changed', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'FAT' } });
    expect(mockOnChange).toHaveBeenCalledWith(['FAT']);
  });

  test('converts numeric values when selected', () => {
    render(
      <ValueDropdown
        parameter={mockNumericParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '100' } });
    expect(mockOnChange).toHaveBeenCalledWith([100]);
  });

  test('displays selected value', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={['NTFS']}
        onChange={mockOnChange}
      />
    );
    
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement.value).toBe('NTFS');
  });

  test('is disabled when disabled prop is true', () => {
    render(
      <ValueDropdown
        parameter={mockStringParameter}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
        disabled={true}
      />
    );
    
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  test('is disabled when parameter is null', () => {
    render(
      <ValueDropdown
        parameter={null}
        selectedOperator={'='}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
