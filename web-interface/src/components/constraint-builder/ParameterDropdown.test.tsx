import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ParameterDropdown from './ParameterDropdown';

describe('ParameterDropdown', () => {
  const mockParameters = [
    { key: 'fileSystem', values: ['FAT', 'NTFS', 'exFAT'] },
    { key: 'size', values: [100, 1000, 10000] },
  ];
  
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders with default placeholder', () => {
    render(
      <ParameterDropdown
        parameters={mockParameters}
        selectedParameter={null}
        onChange={mockOnChange}
        label="Parameter"
      />
    );
    
    expect(screen.getByText('Select parameter')).toBeInTheDocument();
  });

  test('renders with custom placeholder', () => {
    render(
      <ParameterDropdown
        parameters={mockParameters}
        selectedParameter={null}
        onChange={mockOnChange}
        placeholder="Custom placeholder"
        label="Parameter"
      />
    );
    
    expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
  });

  test('renders with label when provided', () => {
    render(
      <ParameterDropdown
        parameters={mockParameters}
        selectedParameter={null}
        onChange={mockOnChange}
        label="Test Label"
      />
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('renders all parameter options', () => {
    render(
      <ParameterDropdown
        parameters={mockParameters}
        selectedParameter={null}
        onChange={mockOnChange}
        label="Parameter"
      />
    );
    
    expect(screen.getByText('fileSystem')).toBeInTheDocument();
    expect(screen.getByText('size')).toBeInTheDocument();
  });

  test('selects parameter when changed', () => {
    render(
      <ParameterDropdown
        parameters={mockParameters}
        selectedParameter={null}
        onChange={mockOnChange}
        label="Parameter"
      />
    );
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fileSystem' } });
    expect(mockOnChange).toHaveBeenCalledWith('fileSystem');
  });

  test('displays selected parameter', () => {
    render(
      <ParameterDropdown
        parameters={mockParameters}
        selectedParameter="fileSystem"
        onChange={mockOnChange}
        label="Parameter"
      />
    );
    
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement.value).toBe('fileSystem');
  });

  test('is disabled when disabled prop is true', () => {
    render(
      <ParameterDropdown
        parameters={mockParameters}
        selectedParameter={null}
        onChange={mockOnChange}
        disabled={true}
        label="Parameter"
      />
    );
    
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
