import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConstraintBuilder from './ConstraintBuilder';

describe('ConstraintBuilder', () => {
  const mockParameters = [
    { key: 'fileSystem', values: ['FAT', 'NTFS', 'exFAT'] },
    { key: 'size', values: [100, 1000, 10000] },
    { key: 'compression', values: ['enabled', 'disabled'] },
  ];
  
  const mockOnAddConstraint = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnAddConstraint.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders with simple constraint type by default', () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Simple Constraint')).toBeInTheDocument();
    expect(screen.getByText('Condition')).toBeInTheDocument();
  });

  test('can switch to IF-THEN constraint type', () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    // Change to IF-THEN constraint type
    fireEvent.change(screen.getByRole('combobox', { name: '' }), { target: { value: 'if-then' } });
    
    expect(screen.getByText('IF Condition')).toBeInTheDocument();
    expect(screen.getByText('THEN Condition')).toBeInTheDocument();
  });

  test('Add Constraint button is disabled initially', () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    const addButton = screen.getByText('Add Constraint');
    expect(addButton).toBeDisabled();
  });

  test('Cancel button calls onCancel', () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('building a valid simple constraint enables the Add button', async () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    // Get all dropdowns
    const dropdowns = screen.getAllByRole('combobox');
    
    // Select parameter
    fireEvent.change(dropdowns[1], { target: { value: 'fileSystem' } });
    
    // Select operator
    fireEvent.change(dropdowns[2], { target: { value: '=' } });
    
    // Select value
    fireEvent.change(dropdowns[3], { target: { value: 'NTFS' } });
    
    // Wait for the preview to update
    await waitFor(() => {
      expect(screen.getByText(/Constraint Preview/)).toBeInTheDocument();
    });
    
    // Check that the Add button is enabled
    const addButton = screen.getByText('Add Constraint');
    expect(addButton).not.toBeDisabled();
  });

  test('clicking Add Constraint with valid constraint calls onAddConstraint', async () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    // Get all dropdowns
    const dropdowns = screen.getAllByRole('combobox');
    
    // Select parameter
    fireEvent.change(dropdowns[1], { target: { value: 'fileSystem' } });
    
    // Select operator
    fireEvent.change(dropdowns[2], { target: { value: '=' } });
    
    // Select value
    fireEvent.change(dropdowns[3], { target: { value: 'NTFS' } });
    
    // Wait for the preview to update
    await waitFor(() => {
      expect(screen.getByText(/Constraint Preview/)).toBeInTheDocument();
    });
    
    // Click Add Constraint
    const addButton = screen.getByText('Add Constraint');
    fireEvent.click(addButton);
    
    // Check that onAddConstraint was called with the correct constraint
    expect(mockOnAddConstraint).toHaveBeenCalledWith('[fileSystem] = "NTFS";');
  });

  test('building a valid IF-THEN constraint enables the Add button', async () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    // Change to IF-THEN constraint type
    fireEvent.change(screen.getByRole('combobox', { name: '' }), { target: { value: 'if-then' } });
    
    // Get all dropdowns after switching to IF-THEN
    const dropdowns = screen.getAllByRole('combobox');
    
    // Select IF parameter
    fireEvent.change(dropdowns[1], { target: { value: 'fileSystem' } });
    
    // Select IF operator
    fireEvent.change(dropdowns[2], { target: { value: '=' } });
    
    // Select IF value
    fireEvent.change(dropdowns[3], { target: { value: 'NTFS' } });
    
    // Select THEN parameter
    fireEvent.change(dropdowns[4], { target: { value: 'compression' } });
    
    // Select THEN operator
    fireEvent.change(dropdowns[5], { target: { value: '=' } });
    
    // Select THEN value
    fireEvent.change(dropdowns[6], { target: { value: 'enabled' } });
    
    // Wait for the preview to update
    await waitFor(() => {
      expect(screen.getByText(/Constraint Preview/)).toBeInTheDocument();
    });
    
    // Check that the Add button is enabled
    const addButton = screen.getByText('Add Constraint');
    expect(addButton).not.toBeDisabled();
  });

  test('constraint preview shows the correct format for numeric values', async () => {
    render(
      <ConstraintBuilder
        parameters={mockParameters}
        onAddConstraint={mockOnAddConstraint}
        onCancel={mockOnCancel}
      />
    );
    
    // Get all dropdowns
    const dropdowns = screen.getAllByRole('combobox');
    
    // Select parameter (size - numeric)
    fireEvent.change(dropdowns[1], { target: { value: 'size' } });
    
    // Select operator
    fireEvent.change(dropdowns[2], { target: { value: '>' } });
    
    // Select value
    fireEvent.change(dropdowns[3], { target: { value: '1000' } });
    
    // Wait for the preview to update
    await waitFor(() => {
      expect(screen.getByText(/Constraint Preview/)).toBeInTheDocument();
    });
    
    // Check that the preview shows the numeric value without quotes
    // Using getByText instead of direct DOM access
    const previewText = screen.getByText(/\[size\] > 1000;/);
    expect(previewText).toBeInTheDocument();
  });
});
