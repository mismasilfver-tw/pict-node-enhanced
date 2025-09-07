import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
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

// Set a reasonable timeout for all tests in this suite
jest.setTimeout(10000); // 10 seconds timeout

describe("Statistics End-to-End Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosPost.mockReset();
    mockAxiosGet.mockReset();

    // Mock API responses
    mockAxiosGet.mockResolvedValue({
      data: [
        {
          name: "Test Example",
          model: [
            { key: "browser", values: ["Chrome", "Firefox", "Safari"] },
            { key: "os", values: ["Windows", "macOS", "Linux"] },
            { key: "version", values: ["v1", "v2", "v3"] },
          ],
        },
      ],
    });
  });

  test("complete workflow: configure model, set order, generate tests, view statistics, and check info modal", async () => {
    // Mock the generate API response with enhanced statistics
    const mockResponse = {
      cases: [
        { browser: "Chrome", os: "Windows", version: "v1" },
        { browser: "Chrome", os: "macOS", version: "v2" },
        { browser: "Firefox", os: "Windows", version: "v3" },
        { browser: "Firefox", os: "Linux", version: "v1" },
        { browser: "Safari", os: "macOS", version: "v3" },
        { browser: "Safari", os: "Linux", version: "v2" },
      ],
      count: 6,
      statistics: {
        order: 2,
        generatedTests: 6,
        theoreticalMax: 27,
        coveragePercentage: 88.89,
        efficiency: "High",
        constraintReduction: 0,
      },
    };
    // Use implementation to handle different requests
    mockAxiosPost.mockImplementation((url, data) => {
      if (url === "/api/generate") {
        return Promise.resolve({ data: mockResponse });
      }
      return Promise.resolve({ data: {} });
    });

    // Render the App
    render(
      <>
        <App />
        <ToastContainer />
      </>,
    );

    // For this test, we'll skip the example loading and manually set up the model
    // The model needs to be set up with browser and OS parameters

    // First verify that the test interface is loaded
    await screen.findByText("PICT-Node", {}, { timeout: 10000 });
    await screen.findByText("Generate Test Cases", {}, { timeout: 10000 });

    // Step 2: Set order to 2 (pairwise)
    const orderSelect = screen.getByRole("combobox", {
      name: /combination order/i,
    });
    fireEvent.change(orderSelect, { target: { value: "2" } });

    // Step 4: Generate test cases
    const generateButton = screen.getByText("Generate Test Cases");
    fireEvent.click(generateButton);

    // Step 5: Verify statistics are displayed
    await waitFor(() => {
      expect(screen.getByText("Coverage Statistics")).toBeInTheDocument();
    });

    // Wait for panel to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("statistics-panel")).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Check statistics display using test IDs and semantic assertions
    const statisticsPanel = screen.getByTestId("statistics-panel");
    const statsPanel = within(statisticsPanel);
    expect(statsPanel.getByText("Order:")).toBeInTheDocument();
    expect(statsPanel.getByTestId("generated-tests-row")).toHaveTextContent(
      "6",
    );
    expect(statsPanel.getByTestId("theoretical-max-row")).toHaveTextContent(
      "27",
    );
    expect(statsPanel.getByTestId("coverage-row")).toHaveTextContent("88.9%");

    // Step 5: Show detailed statistics
    const showDetailsButton = screen.getByText(/Show Details/);
    fireEvent.click(showDetailsButton);

    // Check detailed statistics
    expect(screen.getByText(/Efficiency:/)).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText(/Constraint Reduction:/)).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();

    // Step 6: Open information modal
    const infoButton = screen.getByTitle("Learn about these statistics");
    fireEvent.click(infoButton);

    // Check modal content
    await waitFor(() => {
      expect(
        screen.getByText("Understanding Coverage Statistics"),
      ).toBeInTheDocument();
    });

    // Check that the modal contains the expected content
    const modal = screen.getByRole("dialog");
    expect(modal).toHaveTextContent("Understanding Coverage Statistics");
    expect(modal).toHaveTextContent("Example:");
    expect(modal).toHaveTextContent("3 parameters, each with 3 values");

    // Step 7: Close modal
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    // Modal should be closed
    await waitFor(() => {
      expect(
        screen.queryByText("Understanding Coverage Statistics"),
      ).not.toBeInTheDocument();
    });

    // Step 8: Hide detailed statistics
    const hideDetailsButton = screen.getByText(/Hide Details/);
    fireEvent.click(hideDetailsButton);

    // Detailed stats should be hidden
    expect(screen.queryByText(/Efficiency:/)).not.toBeInTheDocument();

    // Step 9: Clear all values
    const clearButton = screen.getByText("Clear All Values");
    fireEvent.click(clearButton);

    // Confirm clear action
    const confirmButton = screen.getByText("Clear All Values", {
      selector: ".modal-footer button",
    });
    fireEvent.click(confirmButton);

    // Statistics should be cleared
    await waitFor(() => {
      expect(screen.queryByText("Coverage Statistics")).not.toBeInTheDocument();
    });
  });

  test("statistics display with different order values", async () => {
    // Mock responses for different order values
    const mockOrder2Response = {
      cases: [{ browser: "Chrome", os: "Windows" }],
      count: 4,
      statistics: {
        order: 2,
        generatedTests: 4,
        theoreticalMax: 9,
        coveragePercentage: 88.89,
        efficiency: "High",
        constraintReduction: 0,
      },
    };

    const mockOrder3Response = {
      cases: [
        { browser: "Chrome", os: "Windows" },
        { browser: "Firefox", os: "macOS" },
      ],
      count: 8,
      statistics: {
        order: 3,
        generatedTests: 8,
        theoreticalMax: 27,
        coveragePercentage: 74.07,
        efficiency: "Medium",
        constraintReduction: 0,
      },
    };

    // Set up mock to return different responses based on order
    mockAxiosPost.mockImplementation((url, requestData) => {
      if (url === "/api/generate") {
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
    const addParamButton = screen.getByText("Add Parameter");
    fireEvent.click(addParamButton); // Add first parameter
    let nameInputs = screen.getAllByLabelText("Parameter Name");
    fireEvent.change(nameInputs[0], { target: { value: "browser" } });

    // Add values to browser parameter
    const addValueButton = screen.getAllByText("Add Value")[0];

    // Get all value inputs by using their placeholder attribute
    const valueInputs = screen.getAllByPlaceholderText("Value");

    // First parameter's value
    fireEvent.change(valueInputs[0], { target: { value: "Chrome" } });
    fireEvent.click(addValueButton);

    // Get updated list of value inputs after adding one
    const updatedValueInputs = screen.getAllByPlaceholderText("Value");
    fireEvent.change(updatedValueInputs[1], { target: { value: "Firefox" } });
    fireEvent.click(addValueButton);

    // Add OS parameter
    fireEvent.click(addParamButton); // Add second parameter
    nameInputs = screen.getAllByLabelText("Parameter Name");
    fireEvent.change(nameInputs[1], { target: { value: "os" } });

    // Add values to OS parameter
    const secondValueButton = screen.getAllByText("Add Value")[1];

    // Get updated list of value inputs after adding parameter
    const osValueInputs = screen.getAllByPlaceholderText("Value");
    fireEvent.change(osValueInputs[2], { target: { value: "Windows" } });
    fireEvent.click(secondValueButton);

    // Get updated inputs again
    const finalValueInputs = screen.getAllByPlaceholderText("Value");
    fireEvent.change(finalValueInputs[3], { target: { value: "macOS" } });
    fireEvent.click(secondValueButton);

    // Generate with order 2
    // Select order using accessible role and name
    const orderInput = screen.getByRole("combobox", {
      name: /combination order/i,
    });
    fireEvent.change(orderInput, { target: { value: "2" } });

    const generateButton = screen.getByText("Generate Test Cases");
    fireEvent.click(generateButton);

    // Check order 2 statistics
    await waitFor(
      () => {
        expect(screen.getByText("Coverage Statistics")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    const statisticsPanel = screen.getByTestId("statistics-panel");
    expect(within(statisticsPanel).getByText("Order:")).toBeInTheDocument();
    expect(statisticsPanel).toHaveTextContent(/2-way/);

    // Change to order 3 and regenerate
    fireEvent.change(orderInput, { target: { value: "3" } });
    fireEvent.click(generateButton);

    // Check order 3 statistics
    await waitFor(
      () => {
        expect(screen.getByText("Coverage Statistics")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    const statisticsPanel2 = screen.getByTestId("statistics-panel");
    const statsPanel2 = within(statisticsPanel2);

    expect(statsPanel2.getByText("Order:")).toBeInTheDocument();
    expect(statisticsPanel2).toHaveTextContent(/3-way/);
    expect(statisticsPanel2).toHaveTextContent("74.1%");

    // Show details to check efficiency changed
    const showDetailsButton = screen.getByText(/Show Details/);
    fireEvent.click(showDetailsButton);

    // Wait for details to appear after clicking and check efficiency values
    const statsPanelAfterDetails = screen.getByTestId("statistics-panel");
    const efficiencyRow = within(statsPanelAfterDetails).getByTestId(
      "efficiency-row",
    );
    expect(efficiencyRow).toHaveTextContent("Efficiency:");
    expect(efficiencyRow).toHaveTextContent("Medium");
    const constraintReductionRow = within(statsPanelAfterDetails).getByTestId(
      "constraint-reduction-row",
    );
    expect(constraintReductionRow).toHaveTextContent("0.0%");
  });
});
