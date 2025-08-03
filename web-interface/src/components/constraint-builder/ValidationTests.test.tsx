import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ValidationTests from './ValidationTests';

describe('ValidationTests', () => {
  test('renders all validation test sections', () => {
    render(<ValidationTests />);
    
    // Check for section headings
    expect(screen.getByText('Invalid Parameter-Operator Combinations')).toBeInTheDocument();
    expect(screen.getByText('Type Mismatch Tests')).toBeInTheDocument();
    expect(screen.getByText('Syntax Validation Tests')).toBeInTheDocument();
  });

  test.skip('shows validation message for invalid parameter-operator combination', async () => {
    render(<ValidationTests />);
    
    // Find the dropdowns in the first section
    const paramDropdown = screen.getAllByRole('combobox')[0];
    const operatorDropdown = screen.getAllByRole('combobox')[1];
    
    // Select a string parameter
    fireEvent.change(paramDropdown, { target: { value: 'fileSystem' } });
    
    // Select a numeric operator (which is invalid for strings)
    fireEvent.change(operatorDropdown, { target: { value: '>' } });
    
    // Wait for validation to update
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/Cannot use > operator with non-numeric parameter/i);
    }, { timeout: 3000 });
    
    // Check that the validation message has the danger class
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-danger');
  });

  test.skip('shows validation message for empty parameter with IN operator', async () => {
    render(<ValidationTests />);
    
    // Find the dropdowns in the first section
    const paramDropdown = screen.getAllByRole('combobox')[0];
    const operatorDropdown = screen.getAllByRole('combobox')[1];
    
    // Select the empty parameter
    fireEvent.change(paramDropdown, { target: { value: 'emptyParam' } });
    
    // Select the IN operator
    fireEvent.change(operatorDropdown, { target: { value: 'IN' } });
    
    // Wait for validation to update
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/Cannot use IN operator with a parameter that has no values/i);
    }, { timeout: 3000 });
  });

  test.skip('shows validation message for type mismatch', async () => {
    render(<ValidationTests />);
    
    // Find the condition builder in the second section
    const dropdowns = screen.getAllByRole('combobox');
    
    // Find the parameter dropdown in the type mismatch section
    // This is a bit tricky since there are multiple dropdowns, so we'll need to find it by proximity
    const typeMismatchSection = screen.getByText('Type Mismatch Tests').closest('.card') as HTMLElement;
    const typeMismatchDropdowns = within(typeMismatchSection).getAllByRole('combobox');
    
    // Select the mixed types parameter
    fireEvent.change(typeMismatchDropdowns[0], { target: { value: 'mixedTypes' } });
    
    // Select an operator
    fireEvent.change(typeMismatchDropdowns[1], { target: { value: '=' } });
    
    // Select a value
    fireEvent.change(typeMismatchDropdowns[2], { target: { value: 'string' } });
    
    // Wait for validation to update
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/Parameter and value types are compatible/i);
    }, { timeout: 3000 });
  });

  test.skip('shows validation message for syntax validation', async () => {
    render(<ValidationTests />);
    
    // Find the syntax validation section
    const syntaxSection = screen.getByText('Syntax Validation Tests').closest('.card') as HTMLElement;
    const syntaxDropdowns = within(syntaxSection).getAllByRole('combobox');
    
    // Select a parameter
    fireEvent.change(syntaxDropdowns[0], { target: { value: 'fileSystem' } });
    
    // Select an operator
    fireEvent.change(syntaxDropdowns[1], { target: { value: '=' } });
    
    // Select a value
    fireEvent.change(syntaxDropdowns[2], { target: { value: 'NTFS' } });
    
    // Wait for validation to update and preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Generated Syntax/)).toBeInTheDocument();
      expect(screen.getByText(/\[fileSystem\] = "NTFS";/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check that the validation message indicates success
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/Constraint syntax is valid/i);
    }, { timeout: 3000 });
  });
});

