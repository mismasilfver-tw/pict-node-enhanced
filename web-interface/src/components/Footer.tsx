import React from 'react';

const Footer = () => {
  return (
    <div className="footer">
      <hr />
      <p>
        PICT-Node is a wrapper around Microsoft's{' '}
        <a href="https://github.com/microsoft/pict" target="_blank" rel="noopener noreferrer">
          PICT
        </a>{' '}
        (Pairwise Independent Combinatorial Testing) tool.
      </p>
      <p>
        <a href="https://github.com/gmaxlev/pict-node" target="_blank" rel="noopener noreferrer">
          GitHub Repository
        </a>{' '}
        |{' '}
        <a href="https://pict-node.js.org" target="_blank" rel="noopener noreferrer">
          Documentation
        </a>
      </p>
    </div>
  );
};

export default Footer;
