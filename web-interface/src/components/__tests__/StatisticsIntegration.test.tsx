import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import App from "../../App";
import { ToastContainer } from "react-toastify";

// Create a complete axios mock
jest.mock("axios", () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: { baseURL: "" },
}));

// Import the mocked axios
const axios = require("axios");

// Set up axios mock responses
const mockAxiosPost = axios.post as jest.Mock;
const mockAxiosGet = axios.get as jest.Mock;

// Mock the toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container"></div>,
}));

describe("Statistics Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosPost.mockReset();
    mockAxiosGet.mockReset();
    mockAxiosGet.mockResolvedValue({ data: [] });
  });

  test("displays enhanced statistics when test cases are generated", async () => {
    // Mock API response with enhanced statistics
    const mockTestCases = [
      { param1: "value1", param2: "valueA" },
      { param1: "value1", param2: "valueB" },
      { param1: "value2", param2: "valueA" },
      { param1: "value2", param2: "valueB" },
    ];

    const mockStatistics = {
      order: 2,
      generatedTests: 4,
      theoreticalMax: 4,
      coveragePercentage: 100,
      efficiency: "High",
      constraintReduction: 0,
    };

    // Mock API response with implementation to handle different requests
    mockAxiosPost.mockImplementation((url, data) => {
      if (url === "/api/generate") {
        return Promise.resolve({
          data: {
            cases: mockTestCases,
            count: mockTestCases.length,
            statistics: mockStatistics,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    // Render the App component with toast container
    render(
      <>
        <App />
        <ToastContainer />
      </>,
    );

    // Click the generate button
    const generateButton = screen.getByText("Generate Test Cases");
    fireEvent.click(generateButton);

    // Wait for the statistics to be displayed
    await waitFor(() => {
      expect(screen.getByText("Coverage Statistics")).toBeInTheDocument();
    });

    // Get the statistics card using test ID
    const statisticsCard = screen.getByTestId("statistics-panel");
    const statsPanel = within(statisticsCard);

    // Verify that the statistics are displayed correctly
    // Check Order (assert against the card content rather than traversing nodes)
    expect(statsPanel.getByText(/Order:/)).toBeInTheDocument();
    expect(statisticsCard).toHaveTextContent("2-way");
    expect(statisticsCard).toHaveTextContent("Pairwise");

    // Check Generated Tests
    const generatedTestsSection = statsPanel.getByTestId("generated-tests-row");
    expect(generatedTestsSection).toHaveTextContent("4");

    // Check Theoretical Maximum
    const theoreticalMaxSection = statsPanel.getByTestId("theoretical-max-row");
    expect(theoreticalMaxSection).toHaveTextContent("4");

    // Check Coverage
    const coverageSection = statsPanel.getByTestId("coverage-row");
    expect(coverageSection).toHaveTextContent("100.0%");

    // Show details and check additional statistics
    const showDetailsButton = statsPanel.getByRole("button", {
      name: /show details/i,
    });
    fireEvent.click(showDetailsButton);

    // Check detailed statistics
    const efficiencySection = statsPanel.getByTestId("efficiency-row");
    expect(efficiencySection).toHaveTextContent("High");

    const constraintReductionSection = statsPanel.getByTestId(
      "constraint-reduction-row",
    );
    expect(constraintReductionSection).toHaveTextContent("0.0%");
  });

  test("statistics are cleared when Clear All Values is clicked", async () => {
    // Mock API response with enhanced statistics
    const mockTestCases = [
      { param1: "value1", param2: "valueA" },
      { param1: "value2", param2: "valueB" },
    ];

    const mockStatistics = {
      order: 2,
      generatedTests: 2,
      theoreticalMax: 4,
      coveragePercentage: 50,
      efficiency: "Medium",
      constraintReduction: 0,
    };

    // Mock API response with implementation to handle different requests
    mockAxiosPost.mockImplementation((url, data) => {
      if (url === "/api/generate") {
        return Promise.resolve({
          data: {
            cases: mockTestCases,
            count: mockTestCases.length,
            statistics: mockStatistics,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    // Render the App component
    render(<App />);

    // Generate test cases
    const generateButton = screen.getByText("Generate Test Cases");
    fireEvent.click(generateButton);

    // Wait for the statistics to be displayed
    const statisticsCard = await screen.findByTestId("statistics-panel");
    expect(statisticsCard).toBeInTheDocument();

    // Click Clear All Values button
    const clearButton = screen.getByRole("button", {
      name: /clear all values/i,
    });
    fireEvent.click(clearButton);

    // Find and click the confirm button in the modal
    const modal = await screen.findByRole("dialog");
    const confirmButton = within(modal).getByRole("button", {
      name: /clear all values/i,
    });
    fireEvent.click(confirmButton);

    // Verify that statistics are no longer displayed
    await waitFor(
      () => {
        expect(
          screen.queryByTestId("statistics-panel"),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
