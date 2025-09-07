import React from "react";
import { Container, Card, Button } from "react-bootstrap";

const TheoreticalMaximumExplained = () => {
  const handleBackClick = () => {
    // Close the current tab since this page was opened in a new tab
    window.close();
    // Fallback in case window.close() is blocked by the browser
    window.history.back();
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          onClick={handleBackClick}
          className="mb-4"
        >
          &larr; Close this tab
        </Button>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Header as="h4" className="bg-light">
          Understanding Theoretical Maximum in Pairwise Testing
        </Card.Header>
        <Card.Body>
          <Card.Title>Why is the Theoretical Maximum 21 and not 18?</Card.Title>

          <p className="lead">
            The "Theoretical Maximum" in the statistics refers to the total
            number of unique <strong>pairs</strong> that need to be covered in
            2-way testing, not the total number of test cases.
          </p>

          <h5>Example: Browser Testing</h5>
          <p>Let's break down your example with 3 parameters:</p>

          <div className="ms-4 mb-4">
            <div className="mb-2">
              <strong>Browser</strong>: Firefox, Safari, Chrome (3 choices)
            </div>
            <div className="mb-2">
              <strong>Device</strong>: laptop, phone, tablet (3 choices)
            </div>
            <div className="mb-2">
              <strong>Operating System</strong>: MacOS, Windows (2 choices)
            </div>
          </div>

          <h5>1. All-Combinations Approach</h5>
          <p>
            If we tested every possible combination (exhaustive testing), we'd
            need:
          </p>
          <p className="text-center fs-4">
            3 (Browser) × 3 (Device) × 2 (OS) = <strong>18 test cases</strong>
          </p>

          <h5>2. Pairwise (2-way) Testing</h5>
          <p>
            In pairwise testing, we count the number of unique value pairs
            between all parameter combinations:
          </p>

          <div className="ms-4">
            <p>
              <strong>Browser × Device</strong>: 3 × 3 = 9 pairs
            </p>
            <p>
              <strong>Browser × OS</strong>: 3 × 2 = 6 pairs
            </p>
            <p>
              <strong>Device × OS</strong>: 3 × 2 = 6 pairs
            </p>
            <p className="fs-5 mt-3">
              Total unique pairs = 9 + 6 + 6 = <strong>21 pairs</strong>
            </p>
          </div>

          <div className="alert alert-info mt-4">
            <h5>Why the Difference?</h5>
            <p className="mb-0">
              The power of pairwise testing is that we can cover all these 21
              pairs with many fewer than 18 test cases (typically around 9-12
              tests). This is the efficiency that the tool demonstrates in the
              statistics.
            </p>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" onClick={handleBackClick}>
              Close this tab
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TheoreticalMaximumExplained;
