import React from 'react';
import styles from './AppFooter.module.css';

const AppFooter = () => {

  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>&copy; 2024 Points Converter. All rights reserved.</p>
        <p className={`${styles.disclaimer} disclaimer`}>
          Exchange rates are subject to change. Always verify with the official program before transferring.
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;