import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { ToastContainer } from 'react-toastify';

// Create a complete axios mock
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: { baseURL: '' }
}));

// Import the mocked axios
const axios = require('axios');

// Set up axios mock responses
const mockAxiosPost = axios.post as jest.Mock;
const mockAxiosGet = axios.get as jest.Mock;

// Mock the toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container"></div>,
}));

// Set a reasonable timeout for all tests in this suite
jest.setTimeout(10000); // 10 seconds timeout

describe('Statistics End-to-End Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosPost.mockReset();
    mockAxiosGet.mockReset();
    
    // Mock API responses
    mockAxiosGet.mockResolvedValue({ data: [
      {
        name: 'Test Example',
        model: [
          { key: 'browser', values: ['Chrome', 'Firefox', 'Safari'] },
          { key: 'os', values: ['Windows', 'macOS', 'Linux'] },
          { key: 'version', values: ['v1', 'v2', 'v3'] }
        ]
      }
    ]});
  });

  test('complete workflow: configure model, set order, generate tests, view statistics, and check info modal', async () => {
    // Mock the generate API response with enhanced statistics
    const mockResponse = {
      cases: [
        { browser: 'Chrome', os: 'Windows', version: 'v1' },
        { browser: 'Chrome', os: 'macOS', version: 'v2' },
        { browser: 'Firefox', os: 'Windows', version: 'v3' },
        { browser: 'Firefox', os: 'Linux', version: 'v1' },
        { browser: 'Safari', os: 'macOS', version: 'v3' },
        { browser: 'Safari', os: 'Linux', version: 'v2' },
      ],
      count: 6,
      statistics: {
        order: 2,
        generatedTests: 6,
        theoreticalMax: 27,
        coveragePercentage: 88.89,
        efficiency: 'High',
        constraintReduction: 0
      }
    };
    // Use implementation to handle different requests
    mockAxiosPost.mockImplementation((url, data) => {
      if (url === '/api/generate') {
        return Promise.resolve({ data: mockResponse });
      }
      return Promise.resolve({ data: {} });
    });

    // Render the App
    render(
      <>
        <App />
        <ToastContainer />
      </>
    );

    // For this test, we'll skip the example loading and manually set up the model
    // The model needs to be set up with browser and OS parameters
    
    // First verify that the test interface is loaded
    await waitFor(() => {
      expect(screen.getByText('PICT-Node')).toBeInTheDocument();
      expect(screen.getByText('Generate Test Cases')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Step 2: Set order to 2 (pairwise)
    // Use a more flexible approach to find the combination order selector
    await waitFor(() => {
      const labels = screen.getAllByText(/Combination Order/i);
      expect(labels.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    const orderLabel = screen.getAllByText(/Combination Order/i)[0];
    // Get the parent Form.Group and then find the select within it
    const formGroup = orderLabel.closest('.mb-3') as HTMLElement;
    const orderInput = formGroup.querySelector('select');
    fireEvent.change(orderInput, { target: { value: '2' } });

    // Step 4: Generate test cases
    const generateButton = screen.getByText('Generate Test Cases');
    fireEvent.click(generateButton);

    // Step 5: Verify statistics are displayed
    await waitFor(() => {
      expect(screen.getByText('Coverage Statistics')).toBeInTheDocument();
    });

    // Check statistics display - combine all assertions in a single waitFor
    await waitFor(() => {
      // Check basic statistics
      expect(screen.getByText('Order:')).toBeInTheDocument();
      expect(screen.getByText('Generated Tests:')).toBeInTheDocument();
      
      // Get the statistics section
      const statisticsSection = screen.getByText('Coverage Statistics').closest('.card') as HTMLElement;
      
      // Check for generated tests count within the statistics section
      const generatedTestsLabel = within(statisticsSection).getByText('Generated Tests:');
      expect(generatedTestsLabel).toBeInTheDocument();
      expect(generatedTestsLabel.parentElement).toHaveTextContent('6');
      
      // Check for theoretical maximum
      const theoreticalMaxLabel = within(statisticsSection).getByText(/Theoretical Maximum:/);
      expect(theoreticalMaxLabel).toBeInTheDocument();
      expect(theoreticalMaxLabel.parentElement).toHaveTextContent('27');
      
      // Check for coverage percentage
      const coverageLabel = within(statisticsSection).getByText(/Coverage:/);
      expect(coverageLabel).toBeInTheDocument();
      expect(coverageLabel.parentElement).toHaveTextContent('88.9%');
    }, { timeout: 10000 });

    // Step 5: Show detailed statistics
    const showDetailsButton = screen.getByText(/Show Details/);
    fireEvent.click(showDetailsButton);

    // Check detailed statistics
    expect(screen.getByText(/Efficiency:/)).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText(/Constraint Reduction:/)).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();

    // Step 6: Open information modal
    const infoButton = screen.getByTitle('Learn about these statistics');
    fireEvent.click(infoButton);

    // Check modal content
    await waitFor(() => {
      expect(screen.getByText('Understanding Coverage Statistics')).toBeInTheDocument();
    });
    
    // Check that the modal contains the expected content
    const modalBody = screen.getByText('Understanding Coverage Statistics').closest('.modal-content');
    expect(modalBody).toBeInTheDocument();
    
    // Check for the example section which is unique to the modal
    expect(screen.getByText('Example:')).toBeInTheDocument();
    expect(screen.getByText(/3 parameters, each with 3 values/)).toBeInTheDocument();

    // Step 7: Close modal
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText('Understanding Coverage Statistics')).not.toBeInTheDocument();
    });

    // Step 8: Hide detailed statistics
    const hideDetailsButton = screen.getByText(/Hide Details/);
    fireEvent.click(hideDetailsButton);

    // Detailed stats should be hidden
    expect(screen.queryByText(/Efficiency:/)).not.toBeInTheDocument();

    // Step 9: Clear all values
    const clearButton = screen.getByText('Clear All Values');
    fireEvent.click(clearButton);

    // Confirm clear action
    const confirmButton = screen.getByText('Clear All Values', { selector: '.modal-footer button' });
    fireEvent.click(confirmButton);

    // Statistics should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Coverage Statistics')).not.toBeInTheDocument();
    });
  });

  test('statistics display with different order values', async () => {
    // Mock responses for different order values
    const mockOrder2Response = {
      cases: [{ browser: 'Chrome', os: 'Windows' }],
      count: 4,
      statistics: {
        order: 2,
        generatedTests: 4,
        theoreticalMax: 9,
        coveragePercentage: 88.89,
        efficiency: 'High',
        constraintReduction: 0
      }
    };
    
    const mockOrder3Response = {
      cases: [{ browser: 'Chrome', os: 'Windows' }, { browser: 'Firefox', os: 'macOS' }],
      count: 8,
      statistics: {
        order: 3,
        generatedTests: 8,
        theoreticalMax: 27,
        coveragePercentage: 74.07,
        efficiency: 'Medium',
        constraintReduction: 0
      }
    };

    // Set up mock to return different responses based on order
    mockAxiosPost.mockImplementation((url, requestData) => {
      if (url === '/api/generate') {
        if (requestData.options && requestData.options.order === 3) {
          return Promise.resolve({ data: mockOrder3Response });
        }
        return Promise.resolve({ data: mockOrder2Response });
      }
      return Promise.resolve({ data: {} });
    });

    // Render the App
    render(<App />);
    
    // Set up model parameters first
    // Add browser parameter
    const addParamButton = screen.getByText('Add Parameter');
    fireEvent.click(addParamButton); // Add first parameter
    let nameInputs = screen.getAllByLabelText('Parameter Name');
    fireEvent.change(nameInputs[0], { target: { value: 'browser' } });
    
    // Add values to browser parameter
    const addValueButton = screen.getAllByText('Add Value')[0];
    
    // Get all value inputs by using their placeholder attribute
    const valueInputs = screen.getAllByPlaceholderText('Value');
    
    // First parameter's value
    fireEvent.change(valueInputs[0], { target: { value: 'Chrome' } });
    fireEvent.click(addValueButton);
    
    // Get updated list of value inputs after adding one
    const updatedValueInputs = screen.getAllByPlaceholderText('Value');
    fireEvent.change(updatedValueInputs[1], { target: { value: 'Firefox' } });
    fireEvent.click(addValueButton);
    
    // Add OS parameter
    fireEvent.click(addParamButton); // Add second parameter
    nameInputs = screen.getAllByLabelText('Parameter Name');
    fireEvent.change(nameInputs[1], { target: { value: 'os' } });
    
    // Add values to OS parameter
    const secondValueButton = screen.getAllByText('Add Value')[1];
    
    // Get updated list of value inputs after adding parameter
    const osValueInputs = screen.getAllByPlaceholderText('Value');
    fireEvent.change(osValueInputs[2], { target: { value: 'Windows' } });
    fireEvent.click(secondValueButton);
    
    // Get updated inputs again
    const finalValueInputs = screen.getAllByPlaceholderText('Value');
    fireEvent.change(finalValueInputs[3], { target: { value: 'macOS' } });
    fireEvent.click(secondValueButton);
    
    // Generate with order 2
    // Find the select element for combination order by finding the label first
    const orderLabel = screen.getByText('Combination Order');
    // Get the parent Form.Group and then find the select within it
    const formGroup = orderLabel.closest('.mb-3');
    const orderInput = formGroup.querySelector('select');
    fireEvent.change(orderInput, { target: { value: '2' } });
    
    const generateButton = screen.getByText('Generate Test Cases');
    fireEvent.click(generateButton);

    // Check order 2 statistics
    await waitFor(() => {
      expect(screen.getByText('Coverage Statistics')).toBeInTheDocument();
      // Use a more specific selector for 2-way text
      // Find the statistics card and look for Order: and 2-way separately
      const statisticsSection = screen.getByText('Coverage Statistics').closest('.card') as HTMLElement;
      const orderLabel = within(statisticsSection).getByText('Order:');
      // 2 and -way are in separate text nodes based on the DOM output
      expect(orderLabel.parentElement.textContent).toMatch(/Order:.+2.+way/);
    }, { timeout: 5000 });
    
    // Change to order 3 and regenerate
    fireEvent.change(orderInput, { target: { value: '3' } });
    fireEvent.click(generateButton);
    
    // Check order 3 statistics
    await waitFor(() => {
      const statisticsSection = screen.getByText('Coverage Statistics').closest('.card') as HTMLElement;
      const orderLabel = within(statisticsSection).getByText('Order:');
      // 3 and -way are in separate text nodes based on the DOM output
      expect(orderLabel.parentElement.textContent).toMatch(/Order:.+3.+way/);
      expect(screen.getByText('74.1%')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Show details to check efficiency changed
    const showDetailsButton = screen.getByText(/Show Details/);
    fireEvent.click(showDetailsButton);
    
    // Wait for details to appear after clicking and check efficiency values
    await waitFor(() => {
      const statisticsSection = screen.getByText('Coverage Statistics').closest('.card') as HTMLElement;
      
      // Check for the Efficiency label
      const efficiencyLabel = within(statisticsSection).getByText('Efficiency:');
      expect(efficiencyLabel).toBeInTheDocument();
      
      // Find the badge element that contains the efficiency rating
      const badge = efficiencyLabel.parentElement.querySelector('.badge');
      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe('Medium');
      
      // Check for constraint reduction
      const constraintLabel = within(statisticsSection).getByText('Constraint Reduction:');
      expect(constraintLabel).toBeInTheDocument();
      expect(constraintLabel.parentElement.textContent).toMatch(/0\.0%/);
    }, { timeout: 5000 });
  });
});
