import React, { useState } from "react";
import { Card, Button, Modal, Badge, Row, Col } from "react-bootstrap";
import { InfoCircle, ChevronDown, ChevronUp } from "react-bootstrap-icons";

interface EnhancedStatistics {
  order: number;
  generatedTests: number;
  theoreticalMax: number;
  coveragePercentage: number;
  efficiency: string | number;
  constraintReduction: number;
}

interface StatisticsPanelProps {
  statistics: EnhancedStatistics | null;
  isVisible?: boolean;
}

function StatisticsPanel({ 
  statistics, 
  isVisible = true 
}: StatisticsPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!isVisible || !statistics) {
    return null;
  }

  const getEfficiencyVariant = (efficiency: string | number) => {
    // If number (0..1), map thresholds to labels
    if (typeof efficiency === 'number') {
      const val = Number.isFinite(efficiency) ? efficiency : 0;
      if (val >= 0.75) return 'success';
      if (val >= 0.5) return 'warning';
      return 'danger';
    }
    // If string, normalize and map
    switch (efficiency.toLowerCase()) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'secondary';
    }
  };

  const getCoverageVariant = (coverage: number) => {
    if (coverage >= 90) return 'success';
    if (coverage >= 70) return 'warning';
    return 'danger';
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <>
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="me-2">📊</span>
            <strong>Coverage Statistics</strong>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowInfoModal(true)}
            className="p-0 text-info"
            title="Learn about these statistics"
          >
            <InfoCircle size={18} />
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-2">
            <Col sm={6}>
              <strong>Order:</strong> {statistics.order}-way 
              <small className="text-muted ms-1">
                ({statistics.order === 2 ? 'Pairwise' : 
                  statistics.order === 3 ? '3-way' : 
                  `${statistics.order}-way`})
              </small>
            </Col>
            <Col sm={6}>
              <strong>Generated Tests:</strong> {statistics.generatedTests}
            </Col>
          </Row>

          <Row className="mb-2">
            <Col sm={6}>
              <strong>Theoretical Maximum:</strong> {statistics.theoreticalMax}
            </Col>
            <Col sm={6}>
              <strong>Coverage:</strong>{' '}
              <Badge bg={getCoverageVariant(statistics.coveragePercentage)}>
                {formatPercentage(statistics.coveragePercentage)}
              </Badge>
            </Col>
          </Row>

          {showDetails && (
            <Row className="mb-2">
              <Col sm={6}>
                <strong>Efficiency:</strong>{' '}
                <Badge bg={getEfficiencyVariant(statistics.efficiency)}>
                  {typeof statistics.efficiency === 'number'
                    ? `${Math.round(Math.min(1, Math.max(0, statistics.efficiency)) * 100)}%`
                    : statistics.efficiency}
                </Badge>
              </Col>
              <Col sm={6}>
                <strong>Constraint Reduction:</strong>{' '}
                {formatPercentage(statistics.constraintReduction)}
              </Col>
            </Row>
          )}

          <div className="mt-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="d-flex align-items-center"
            >
              {showDetails ? (
                <>
                  Hide Details <ChevronUp className="ms-1" />
                </>
              ) : (
                <>
                  Show Details <ChevronDown className="ms-1" />
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Information Modal */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Understanding Coverage Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6>📈 <strong>Order</strong></h6>
            <p className="text-muted mb-3">
              Determines n-way coverage. Order 2 means pairwise testing (all pairs of parameter values), 
              order 3 means 3-way testing (all triplets), and so on.
            </p>

            <h6>🎯 <strong>Generated Tests</strong></h6>
            <p className="text-muted mb-3">
              The number of test cases that PICT generated to achieve the desired coverage.
            </p>

            <h6>📊 <strong>Theoretical Maximum</strong></h6>
            <p className="text-muted mb-1">
              The total number of possible n-way combinations for your parameters. 
              This represents the exhaustive testing approach.
            </p>
            <p className="mb-3">
              <a href="/theoretical-maximum" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                Read more about how this is calculated
              </a>
            </p>

            <h6>✅ <strong>Coverage Percentage</strong></h6>
            <p className="text-muted mb-3">
              The percentage of theoretical combinations that are covered by the generated test suite. 
              PICT aims for 100% coverage but may achieve slightly less due to optimization.
            </p>

            <h6>⚡ <strong>Efficiency</strong></h6>
            <p className="text-muted mb-3">
              How well PICT optimized the test suite. High efficiency means fewer tests 
              while maintaining good coverage.
            </p>

            <h6>🔒 <strong>Constraint Reduction</strong></h6>
            <p className="text-muted mb-3">
              The percentage reduction in possible combinations due to constraints. 
              Higher values indicate more restrictive constraints.
            </p>
          </div>

          <div className="bg-light p-3 rounded">
            <h6>Example:</h6>
            <p className="mb-1">
              <strong>Scenario:</strong> 3 parameters, each with 3 values, 2-way coverage
            </p>
            <p className="mb-1">
              <strong>Theoretical Maximum:</strong> 27 combinations (3×3×3)
            </p>
            <p className="mb-1">
              <strong>PICT Generated:</strong> 9 tests
            </p>
            <p className="mb-0">
              <strong>Coverage:</strong> 100% (all pairs covered at least once)
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StatisticsPanel;
