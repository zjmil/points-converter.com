import React from 'react';

const AppHeader = () => {
  return (
    <header style={styles.header}>
      <div className="container">
        <h1 style={styles.h1}>Points Converter</h1>
        <p style={styles.tagline}>Convert between loyalty points programs with current exchange rates</p>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '2rem 0',
    textAlign: 'center'
  },
  h1: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0' // Reset default margins and set only bottom
  },
  tagline: {
    fontSize: '1.1rem',
    opacity: 0.9,
    margin: 0 // Reset default paragraph margins
  }
};

// Media query styles would typically be handled with CSS-in-JS libraries like styled-components
// or emotion, or with a separate CSS file. For a pure inline-style approach, you would need
// to use JavaScript to detect screen size and conditionally apply styles.

export default AppHeader;