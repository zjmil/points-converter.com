import { useMultiStepSettings } from '../hooks/useMultiStepSettings';
import styles from './DollarValueToggle.module.css'; // Reuse the same styles

const MultiStepToggle = ({ onChange }) => {
  const { multiStepEnabled, updateMultiStepEnabled } = useMultiStepSettings(onChange);

  const handleChange = (event) => {
    updateMultiStepEnabled(event.target.checked);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <input 
          type="checkbox" 
          checked={multiStepEnabled}
          onChange={handleChange}
          className={styles.input}
        />
        <span className={`${styles.switch} ${multiStepEnabled ? styles.checked : ''}`}>
          <span className={`${styles.switchKnob} ${multiStepEnabled ? styles.checked : ''}`}></span>
        </span>
        <span className={styles.text}>Show multi-step conversions</span>
      </label>
    </div>
  );
};

export default MultiStepToggle;