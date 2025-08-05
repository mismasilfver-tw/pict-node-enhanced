import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ConstraintBuilderTest from './ConstraintBuilderTest';

describe('ConstraintBuilderTest', () => {
  test('renders with component tests tab active by default', () => {
    render(<ConstraintBuilderTest />);
    
    // Check for tab navigation
    expect(screen.getByText('Component Tests')).toBeInTheDocument();
    expect(screen.getByText('Validation Tests')).toBeInTheDocument();
    
    // Check that Component Tests tab is active
    const componentsTab = screen.getByRole('tab', { name: /Component Tests/i });
    expect(componentsTab).toHaveClass('active');
    
    // Check that component test content is visible
    expect(screen.getByText('Parameter Dropdown')).toBeInTheDocument();
    expect(screen.getByText('Operator Dropdown')).toBeInTheDocument();
    expect(screen.getByText('Value Dropdown')).toBeInTheDocument();
  });

  test('can switch to validation tests tab', () => {
    render(<ConstraintBuilderTest />);
    
    // Click on the Validation Tests tab
    fireEvent.click(screen.getByText('Validation Tests'));
    
    // Check that Validation Tests tab is now active
    const validationTab = screen.getByRole('tab', { name: /Validation Tests/i });
    expect(validationTab).toHaveClass('active');
    
    // Check that validation test content is visible
    expect(screen.getByText('Invalid Parameter-Operator Combinations')).toBeInTheDocument();
    expect(screen.getByText('Type Mismatch Validation')).toBeInTheDocument();
    expect(screen.getByText('Constraint Syntax Validation')).toBeInTheDocument();
  });

  test('parameter dropdown works in component tests', () => {
    render(<ConstraintBuilderTest />);
    
    // Find the parameter dropdown in the component tests section
    const parameterDropdowns = screen.getAllByLabelText('Select parameter');
    const parameterDropdown = parameterDropdowns[0]; // First parameter dropdown
    
    // Select a parameter
    fireEvent.change(parameterDropdown, { target: { value: 'fileSystem' } });
    
    // Check that the selected parameter is displayed in the preview
    expect(screen.getByText(/Selected parameter: fileSystem/)).toBeInTheDocument();
  });

  test('operator dropdown works in component tests', () => {
    render(<ConstraintBuilderTest />);
    
    // First select a parameter to enable the operator dropdown
    const parameterDropdowns = screen.getAllByLabelText('Select parameter');
    fireEvent.change(parameterDropdowns[0], { target: { value: 'fileSystem' } });
    
    // Find the operator dropdown
    const operatorDropdowns = screen.getAllByLabelText('Operator selection');
    const operatorDropdown = operatorDropdowns[0]; // First operator dropdown
    
    // Select an operator
    fireEvent.change(operatorDropdown, { target: { value: '=' } });
    
    // Check that the selected operator is displayed in the preview
    expect(screen.getByText(/Selected operator: =/)).toBeInTheDocument();
  });

  test('value dropdown works in component tests', () => {
    render(<ConstraintBuilderTest />);
    
    // First select a parameter to enable the operator dropdown
    const parameterDropdowns = screen.getAllByLabelText('Select parameter');
    fireEvent.change(parameterDropdowns[0], { target: { value: 'fileSystem' } });
    
    // Then select an operator to enable the value dropdown
    const operatorDropdowns = screen.getAllByLabelText('Operator selection');
    fireEvent.change(operatorDropdowns[0], { target: { value: '=' } });
    
    // Find the value dropdown
    const valueDropdowns = screen.getAllByLabelText('Value selection');
    const valueDropdown = valueDropdowns[0]; // First value dropdown
    
    // Select a value
    fireEvent.change(valueDropdown, { target: { value: 'NTFS' } });
    
    // Check that the selected value is displayed in the preview
    expect(screen.getByText(/Selected values: NTFS/)).toBeInTheDocument();
  });

  test('condition builder works in component tests', async () => {
    render(<ConstraintBuilderTest />);
    
    // Find the condition builder section
    const conditionBuilderSection = screen.getByText('Condition Builder').parentElement;
    // Use within function from Testing Library
    const { getAllByRole } = within(conditionBuilderSection as HTMLElement);
    const dropdowns = getAllByRole('combobox');
    
    // Select parameter
    fireEvent.change(dropdowns[0], { target: { value: 'fileSystem' } });
    
    // Select operator
    fireEvent.change(dropdowns[1], { target: { value: '=' } });
    
    // Select value
    fireEvent.change(dropdowns[2], { target: { value: 'NTFS' } });
    
    // Check that the condition preview is updated
    await waitFor(() => {
      expect(screen.getByText(/Condition: \[fileSystem\] = "NTFS"/)).toBeInTheDocument();
    });
  });

  test('logical operator selector works in component tests', () => {
    render(<ConstraintBuilderTest />);
    
    // Find the logical operator section
    const logicalOperatorSection = screen.getByText('Logical Operator Selector').parentElement;
    
    // Find the OR button using within and getByRole
    const { getByText } = within(logicalOperatorSection as HTMLElement);
    const orButton = getByText('OR');
    
    // Click the OR button
    fireEvent.click(orButton);
    
    // Check that the selected operator is updated
    expect(screen.getByText(/Selected logical operator: OR/)).toBeInTheDocument();
  });

  test('constraint builder preview updates when building constraint', async () => {
    render(<ConstraintBuilderTest />);
    
    // Find the complete constraint builder section
    const completeBuilderSection = screen.getByText('Complete Constraint Builder').parentElement;
    
    // Find the dropdowns within the constraint builder using within
    const { getAllByRole } = within(completeBuilderSection as HTMLElement);
    const dropdowns = getAllByRole('combobox');
    
    // Select simple constraint type (should be default)
    
    // Select parameter
    fireEvent.change(dropdowns[1], { target: { value: 'fileSystem' } });
    
    // Select operator
    fireEvent.change(dropdowns[2], { target: { value: '=' } });
    
    // Select value
    fireEvent.change(dropdowns[3], { target: { value: 'NTFS' } });
    
    // Wait for the constraint preview to update
    await waitFor(() => {
      // Use getByText directly instead of closest
      expect(screen.getByText(/\[fileSystem\] = "NTFS";/)).toBeInTheDocument();
    });
  });
});
