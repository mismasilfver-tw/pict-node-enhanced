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

  // Fetch examples when component mounts
  useEffect(() => {
    fetchExamples();
  }, []);

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

      <Row>
        <Col>
          <ExamplesDropdown
            examples={examples}
            onSelect={handleExampleSelect}
          />
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
              <Button
                variant="primary"
                onClick={generateTestCases}
                disabled={loading}
                className="mt-3"
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
    </Container>
  );
};

export default App;
