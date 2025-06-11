import React from 'react';

const AppFooter = () => {
  const footerStyle = {
    backgroundColor: '#2c3e50',
    color: 'white',
    textAlign: 'center',
    padding: '2rem 0',
    marginTop: '4rem'
  };

  const containerStyle = {
    // Add any container-specific styles if needed
  };

  const disclaimerStyle = {
    fontSize: '0.9rem',
    opacity: 0.8,
    marginTop: '0.5rem'
  };

  return (
    <footer style={footerStyle}>
      <div className="container" style={containerStyle}>
        <p>&copy; 2024 Points Converter. All rights reserved.</p>
        <p style={disclaimerStyle} className="disclaimer">
          Exchange rates are subject to change. Always verify with the official program before transferring.
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;