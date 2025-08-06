import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
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

describe('Statistics Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosPost.mockReset();
    mockAxiosGet.mockReset();
    mockAxiosGet.mockResolvedValue({ data: [] });
  });

  test('displays enhanced statistics when test cases are generated', async () => {
    // Mock API response with enhanced statistics
    const mockTestCases = [
      { param1: 'value1', param2: 'valueA' },
      { param1: 'value1', param2: 'valueB' },
      { param1: 'value2', param2: 'valueA' },
      { param1: 'value2', param2: 'valueB' },
    ];
    
    const mockStatistics = {
      order: 2,
      generatedTests: 4,
      theoreticalMax: 4,
      coveragePercentage: 100,
      efficiency: 'High',
      constraintReduction: 0
    };

    // Mock API response with implementation to handle different requests
    mockAxiosPost.mockImplementation((url, data) => {
      if (url === '/api/generate') {
        return Promise.resolve({
          data: {
            cases: mockTestCases,
            count: mockTestCases.length,
            statistics: mockStatistics
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    // Render the App component with toast container
    render(
      <>
        <App />
        <ToastContainer />
      </>
    );

    // Click the generate button
    const generateButton = screen.getByText('Generate Test Cases');
    fireEvent.click(generateButton);

    // Wait for the statistics to be displayed
    await waitFor(() => {
      expect(screen.getByText('Coverage Statistics')).toBeInTheDocument();
    });

    // Get the statistics section
    const statisticsSection = screen.getByText('Coverage Statistics').closest('.card') as HTMLElement;
    const statsPanel = within(statisticsSection);
    
    // Verify that the statistics are displayed correctly within the statistics section
    const orderRow = statsPanel.getByText('Order:').closest('.row');
    expect(orderRow).toHaveTextContent('Order: 2-way(Pairwise)');
    
    // Check Generated Tests
    const generatedTestsLabel = statsPanel.getByText('Generated Tests:');
    expect(generatedTestsLabel).toBeInTheDocument();
    const generatedTestsValue = generatedTestsLabel.parentElement?.textContent?.match(/\d+/)?.[0];
    expect(generatedTestsValue).toBe('4');
    
    // Check Theoretical Maximum
    const theoreticalMaxLabel = statsPanel.getByText('Theoretical Maximum:');
    expect(theoreticalMaxLabel).toBeInTheDocument();
    const theoreticalMaxValue = theoreticalMaxLabel.parentElement?.textContent?.match(/\d+/)?.[0];
    expect(theoreticalMaxValue).toBe('4');
    
    // Check Coverage
    expect(statsPanel.getByText('Coverage:')).toBeInTheDocument();
    expect(statsPanel.getByText('100.0%')).toBeInTheDocument();

    // Show details and check additional statistics
    const showDetailsButton = screen.getByText(/Show Details/);
    fireEvent.click(showDetailsButton);

    expect(screen.getByText(/Efficiency:/)).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText(/Constraint Reduction:/)).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  test('statistics are cleared when Clear All Values is clicked', async () => {
    // Mock API response with enhanced statistics
    const mockTestCases = [
      { param1: 'value1', param2: 'valueA' },
      { param1: 'value2', param2: 'valueB' },
    ];
    
    const mockStatistics = {
      order: 2,
      generatedTests: 2,
      theoreticalMax: 4,
      coveragePercentage: 50,
      efficiency: 'Medium',
      constraintReduction: 0
    };

    // Mock API response with implementation to handle different requests
    mockAxiosPost.mockImplementation((url, data) => {
      if (url === '/api/generate') {
        return Promise.resolve({
          data: {
            cases: mockTestCases,
            count: mockTestCases.length,
            statistics: mockStatistics
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    // Render the App component
    render(<App />);

    // Generate test cases
    const generateButton = screen.getByText('Generate Test Cases');
    fireEvent.click(generateButton);

    // Wait for the statistics to be displayed
    await waitFor(() => {
      expect(screen.getByText('Coverage Statistics')).toBeInTheDocument();
    });

    // Click Clear All Values button
    const clearButton = screen.getByText('Clear All Values');
    fireEvent.click(clearButton);

    // Confirm the clear action
    const confirmButton = screen.getByText('Clear All Values', { selector: '.modal-footer button' });
    fireEvent.click(confirmButton);

    // Verify that statistics are no longer displayed
    await waitFor(() => {
      expect(screen.queryByText('Coverage Statistics')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
