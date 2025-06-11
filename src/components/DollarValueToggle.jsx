import React, { useState } from 'react';

const DollarValueToggle = ({ value, onChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (event) => {
    onChange(event.target.checked);
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: '0.9rem',
      color: '#555',
      userSelect: 'none',
    },
    input: {
      display: 'none',
    },
    switch: {
      position: 'relative',
      width: '44px',
      height: '24px',
      backgroundColor: value 
        ? (isHovered ? '#2980b9' : '#3498db') 
        : (isHovered ? '#bbb' : '#ddd'),
      borderRadius: '12px',
      marginRight: '0.75rem',
      transition: 'background-color 0.3s ease',
    },
    switchKnob: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: 'transform 0.3s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transform: value ? 'translateX(20px)' : 'translateX(0)',
    },
    text: {
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <label 
        style={styles.label}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input 
          type="checkbox" 
          checked={value}
          onChange={handleChange}
          style={styles.input}
        />
        <span style={styles.switch}>
          <span style={styles.switchKnob}></span>
        </span>
        <span style={styles.text}>Show dollar values</span>
      </label>
    </div>
  );
};

export default DollarValueToggle;

// Alternative: CSS Classes Version
// If you prefer using CSS classes, here's the component with classes:
/*
const DollarValueToggle = ({ value, onChange }) => {
  const handleChange = (event) => {
    onChange(event.target.checked);
  };

  return (
    <div className="dollar-value-toggle">
      <label className="toggle-label">
        <input 
          type="checkbox" 
          checked={value}
          onChange={handleChange}
          className="toggle-input"
        />
        <span className="toggle-switch"></span>
        <span className="toggle-text">Show dollar values</span>
      </label>
    </div>
  );
};
*/

// CSS for the classes version (add to your CSS file):
/*
.dollar-value-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  user-select: none;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #ddd;
  border-radius: 12px;
  margin-right: 0.75rem;
  transition: background-color 0.3s ease;
}

.toggle-switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-input:checked + .toggle-switch {
  background-color: #3498db;
}

.toggle-input:checked + .toggle-switch::before {
  transform: translateX(20px);
}

.toggle-text {
  font-weight: 500;
}

.toggle-label:hover .toggle-switch {
  background-color: #bbb;
}

.toggle-input:checked + .toggle-switch:hover {
  background-color: #2980b9;
}
*/