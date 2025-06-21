import React from 'react';
import { Dropdown } from 'react-bootstrap';

interface Parameter {
  key: string;
  values: any[];
}

interface Example {
  name: string;
  model: Parameter[];
}

interface ExamplesDropdownProps {
  examples: Example[];
  onSelect: (example: Example) => void;
}

const ExamplesDropdown = ({ examples, onSelect }: ExamplesDropdownProps) => {
  if (!examples || examples.length === 0) {
    return null;
  }

  return (
    <div className="examples-dropdown">
      <Dropdown>
        <Dropdown.Toggle variant="outline-secondary">
          Load Example
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {examples.map((example, index) => (
            <Dropdown.Item 
              key={index} 
              onClick={() => onSelect(example)}
            >
              {example.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default ExamplesDropdown;
