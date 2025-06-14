import styles from './AdvancedSettings.module.css';

const ProgramValueEditor = ({ 
  program, 
  index, 
  customDollarValues, 
  onUpdateValue, 
  onReset 
}) => {
  const getCentsValue = () => {
    const dollarValue = getDollarValue();
    return (dollarValue * 100).toFixed(2);
  };

  const getDollarValue = () => {
    if (customDollarValues && customDollarValues[program.id] !== undefined) {
      return customDollarValues[program.id];
    }
    return program.defaultValue || 0;
  };

  const updateCentsValue = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    const dollarValue = numValue / 100;
    onUpdateValue(program.id, dollarValue);
  };

  return (
    <tr className={index % 2 === 1 ? styles.programTableTrEven : ''}>
      <td className={`${styles.programTableTd} ${styles.programLabel}`}>
        {program.name}
      </td>
      <td className={styles.programTableTd}>
        <input
          id={`cents-${program.id}`}
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={getCentsValue()}
          onChange={(e) => updateCentsValue(e.target.value)}
          className={styles.centsInput}
        />
        <span className={styles.centsSymbol}>¢</span>
      </td>
      <td className={styles.programTableTd}>
        <button 
          onClick={() => onReset(program.id)}
          className={styles.resetButton}
          type="button"
        >
          Reset
        </button>
      </td>
    </tr>
  );
};

export default ProgramValueEditor;