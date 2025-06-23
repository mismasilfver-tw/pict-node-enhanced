import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { toast } from "react-toastify";
import ReactJson from "react-json-view";
import ModelEditor from "./components/ModelEditor";
import TestCasesViewer from "./components/TestCasesViewer";
import ExamplesDropdown from "./components/ExamplesDropdown";
import ConstraintsEditor from "./components/ConstraintsEditor";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Define TypeScript interfaces
interface Parameter {
  key: string;
  values: any[];
}

interface Example {
  name: string;
  model: Parameter[];
}

interface TestCase {
  [key: string]: any;
}

interface Options {
  order?: number;
}

interface SavedScenario {
  name: string;
  model: Parameter[];
  constraints: string[];
}

const App = () => {
  const [model, setModel] = useState([
    { key: "parameter1", values: ["value1", "value2"] },
  ]);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examples, setExamples] = useState([]);
  const [options, setOptions] = useState({ order: 2 });
  const [constraints, setConstraints] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [savedScenarios, setSavedScenarios] = useState([] as SavedScenario[]);

  // Fetch examples and load saved scenarios when component mounts
  useEffect(() => {
    fetchExamples();
    loadSavedScenarios();
  }, []);

  // Load saved scenarios from localStorage
  const loadSavedScenarios = () => {
    const savedData = localStorage.getItem("pictNodeSavedScenarios");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as SavedScenario[];
        setSavedScenarios(parsed);
      } catch (err) {
        console.error("Failed to parse saved scenarios:", err);
      }
    }
  };

  const fetchExamples = async () => {
    try {
      const response = await axios.get("/api/examples");
      const data = response.data as any;
      if (data && data.examples) {
        setExamples(data.examples);
      }
    } catch (err) {
      console.error("Failed to fetch examples:", err);
      toast.error("Failed to fetch examples");
    }
  };

  const handleModelChange = (newModel: Parameter[]) => {
    setModel(newModel);
  };

  const handleOptionsChange = (newOptions: Options) => {
    setOptions(newOptions);
  };

  const handleExampleSelect = (example: Example) => {
    setModel(example.model);
    // Clear constraints when loading a new example
    setConstraints([]);
    toast.info(`Loaded example: ${example.name}`);
  };

  const clearAllValues = () => {
    // Reset model to initial state
    setModel([{ key: "parameter1", values: ["value1", "value2"] }]);
    // Clear all constraints
    setConstraints([]);
    // Clear test cases
    setTestCases([]);
    // Hide the modal
    setShowClearModal(false);
    // Show success message
    toast.info("All values have been cleared");
  };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      toast.error("Please enter a name for your scenario");
      return;
    }

    // Create new scenario object
    const newScenario = {
      name: scenarioName,
      model: [...model],
      constraints: [...constraints],
    };

    // Check if name already exists
    const existingIndex = savedScenarios.findIndex(
      (s) => s.name === scenarioName
    );
    let updatedScenarios;

    if (existingIndex >= 0) {
      // Update existing scenario
      updatedScenarios = [...savedScenarios];
      updatedScenarios[existingIndex] = newScenario;
      toast.info(`Updated scenario: ${scenarioName}`);
    } else {
      // Add new scenario
      updatedScenarios = [...savedScenarios, newScenario];
      toast.success(`Saved scenario: ${scenarioName}`);
    }

    // Save to state and localStorage
    setSavedScenarios(updatedScenarios);
    localStorage.setItem(
      "pictNodeSavedScenarios",
      JSON.stringify(updatedScenarios)
    );

    // Reset and close modal
    setScenarioName("");
    setShowSaveModal(false);
  };

  const handleLoadSavedScenario = (scenario: SavedScenario) => {
    setModel(scenario.model);
    setConstraints(scenario.constraints);
    toast.info(`Loaded scenario: ${scenario.name}`);
  };

  const generateTestCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/generate", {
        model,
        options,
        constraints: constraints.length > 0 ? constraints : undefined,
      });

      const data = response.data as any;
      if (data && data.cases) {
        setTestCases(data.cases);
        toast.success(
          `Generated ${data.count || data.cases.length} test cases`
        );
      }
    } catch (err: any) {
      console.error("Error generating test cases:", err);
      setError(err.response?.data?.error || "Failed to generate test cases");
      toast.error("Failed to generate test cases");
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    if (testCases.length === 0) {
      toast.warning("No test cases to export");
      return;
    }

    // Get all unique keys from test cases
    const keys = Array.from(
      new Set(testCases.flatMap((testCase) => Object.keys(testCase)))
    );

    // Create CSV header
    let csv = keys.join(",") + "\n";

    // Add rows
    testCases.forEach((testCase) => {
      const row = keys.map((key) => {
        const value = testCase[key as keyof typeof testCase];
        // Handle different value types
        if (value === undefined || value === null) return "";
        if (typeof value === "object")
          return JSON.stringify(value).replace(/,/g, ";");
        return String(value).replace(/,/g, ";");
      });
      csv += row.join(",") + "\n";
    });

    // Create and download file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "test-cases.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("CSV file downloaded");
  };

  const exportToJson = () => {
    if (testCases.length === 0) {
      toast.warning("No test cases to export");
      return;
    }

    const json = JSON.stringify(testCases, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "test-cases.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("JSON file downloaded");
  };

  return (
    <Container className="app-container">
      <Header />

      <Row className="mb-3">
        <Col md={6}>
          <ExamplesDropdown
            examples={examples}
            onSelect={handleExampleSelect}
          />
        </Col>
        <Col md={6}>
          {savedScenarios.length > 0 && (
            <div className="d-flex align-items-center">
              <span className="me-2">Load saved scenario:</span>
              <select
                className="form-select"
                onChange={(e) => {
                  const selected = savedScenarios.find(
                    (s) => s.name === e.target.value
                  );
                  if (selected) handleLoadSavedScenario(selected);
                  // Reset select after loading
                  e.target.value = "";
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a saved scenario
                </option>
                {savedScenarios.map((scenario, index) => (
                  <option key={index} value={scenario.name}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Test Model</Card.Header>
            <Card.Body>
              <ModelEditor
                model={model}
                onChange={handleModelChange}
                options={options}
                onOptionsChange={handleOptionsChange}
              />

              <ConstraintsEditor
                model={model}
                constraints={constraints}
                onChange={setConstraints}
              />
              <div className="d-flex mt-3">
                <Button
                  variant="primary"
                  onClick={generateTestCases}
                  disabled={loading}
                  className="me-2"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Generating...
                    </>
                  ) : (
                    "Generate Test Cases"
                  )}
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() => setShowSaveModal(true)}
                  className="me-2"
                >
                  Save Values
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowClearModal(true)}
                >
                  Clear All Values
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              Test Cases
              <span className="float-end">
                {testCases.length > 0 && `${testCases.length} cases`}
              </span>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <TestCasesViewer testCases={testCases} />

              {testCases.length > 0 && (
                <div className="export-buttons">
                  <Button variant="outline-secondary" onClick={exportToCsv}>
                    Export to CSV
                  </Button>{" "}
                  <Button variant="outline-secondary" onClick={exportToJson}>
                    Export to JSON
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Footer />

      {/* Confirmation Modal for Clear All Values */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Clear All Values</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to clear all parameters and constraints? This
          action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={clearAllValues}>
            Clear All Values
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Save Scenario Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save Scenario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Scenario Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter a name for this scenario"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              pattern="[A-Za-z0-9 ]+"
              title="Name can contain letters, numbers, and spaces"
            />
            <div className="form-text text-muted">
              Name can contain letters, numbers, and spaces.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveScenario}>
            Save Scenario
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default App;
