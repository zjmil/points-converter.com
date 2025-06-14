import React from 'react';
import styles from './AppHeader.module.css';

const AppHeader = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <h1 className={styles.h1}>Points Converter</h1>
        <p className={styles.tagline}>Convert between loyalty points programs with current exchange rates</p>
      </div>
    </header>
  );
};


export default AppHeader;