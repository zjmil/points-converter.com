import styles from './AppHeader.module.css';

const AppHeader = ({ onReset }) => {
  return (
    <header className={styles.header}>
      <div className="container">
        <h1 className={styles.h1} onClick={onReset}>Points Converter</h1>
        <p className={styles.tagline}>Convert between loyalty points programs with current exchange rates</p>
      </div>
    </header>
  );
};


export default AppHeader;