import React, { useState } from 'react';
import styles from './DollarValueToggle.module.css';

const DollarValueToggle = ({ value, onChange }) => {
  const handleChange = (event) => {
    onChange(event.target.checked);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <input 
          type="checkbox" 
          checked={value}
          onChange={handleChange}
          className={styles.input}
        />
        <span className={`${styles.switch} ${value ? styles.checked : ''}`}>
          <span className={`${styles.switchKnob} ${value ? styles.checked : ''}`}></span>
        </span>
        <span className={styles.text}>Show dollar values</span>
      </label>
    </div>
  );
};

export default DollarValueToggle;

