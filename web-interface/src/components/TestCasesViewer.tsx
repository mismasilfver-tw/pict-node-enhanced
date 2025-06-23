import React, { useState } from "react";
import { Table, Alert, Pagination } from "react-bootstrap";

interface TestCase {
  [key: string]: any;
}

interface TestCasesViewerProps {
  testCases: TestCase[];
}

const TestCasesViewer = ({ testCases }: TestCasesViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [casesPerPage] = useState(10);

  if (!testCases || testCases.length === 0) {
    return (
      <Alert variant="info">
        No test cases generated yet. Configure your model and click "Generate
        Test Cases".
      </Alert>
    );
  }

  // Get column headers from all test cases
  const headers = Array.from(
    new Set(testCases.flatMap((testCase) => Object.keys(testCase)))
  );

  // Pagination logic
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = testCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(testCases.length / casesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Format cell value for display
  const formatCellValue = (value: any): string => {
    if (value === undefined || value === null) {
      return "";
    } else if (typeof value === "object") {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  };

  return (
    <div>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentCases.map((testCase, rowIndex) => (
              <tr key={rowIndex}>
                <td>{indexOfFirstCase + rowIndex + 1}</td>
                {headers.map((header, colIndex) => (
                  <td key={colIndex}>{formatCellValue(testCase[header])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2
            )
            .map((page, index, array) => {
              // Add ellipsis if there are gaps in the page numbers
              if (index > 0 && page - array[index - 1] > 1) {
                return (
                  <React.Fragment key={`ellipsis-${page}`}>
                    <Pagination.Ellipsis disabled />
                    <Pagination.Item
                      active={page === currentPage}
                      onClick={() => paginate(page)}
                    >
                      {page}
                    </Pagination.Item>
                  </React.Fragment>
                );
              }
              return (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => paginate(page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}

          <Pagination.Next
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}

      <div className="text-muted text-center mt-2">
        Showing {indexOfFirstCase + 1}-
        {Math.min(indexOfLastCase, testCases.length)} of {testCases.length} test
        cases
      </div>
    </div>
  );
};

export default TestCasesViewer;
