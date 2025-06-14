import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import styles from './AdvancedSettings.module.css';

const AdvancedSettings = ({ programs, customDollarValues, onCustomDollarValuesChange, onMultiStepEnabledChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [storedSettings, setStoredSettings] = useLocalStorage('points-converter-settings', {
    customDollarValues: {},
    multiStepEnabled: false
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    if (storedSettings.customDollarValues && Object.keys(storedSettings.customDollarValues).length > 0) {
      onCustomDollarValuesChange(storedSettings.customDollarValues);
    }
    onMultiStepEnabledChange(storedSettings.multiStepEnabled);
  }, [onCustomDollarValuesChange, onMultiStepEnabledChange, storedSettings]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMultiStepChange = (e) => {
    const enabled = e.target.checked;
    setStoredSettings(prev => ({ ...prev, multiStepEnabled: enabled }));
    onMultiStepEnabledChange(enabled);
  };

  // Group programs by type
  const groupedPrograms = useMemo(() => {
    if (!programs) return { bank: [], hotel: [], airline: [] };
    
    const groups = { bank: [], hotel: [], airline: [] };
    
    Object.entries(programs).forEach(([id, program]) => {
      const prog = { id, name: program.name, type: program.type, defaultValue: program.dollarValue || 0 };
      if (groups[program.type]) {
        groups[program.type].push(prog);
      }
    });
    
    // Sort each group alphabetically
    Object.keys(groups).forEach(type => {
      groups[type].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return groups;
  }, [programs]);

  const getGroupDisplayName = (groupName) => {
    const names = {
      bank: 'Bank Points',
      hotel: 'Hotel Programs', 
      airline: 'Airline Programs'
    };
    return names[groupName] || groupName;
  };

  const getCentsValue = (programId) => {
    // Convert dollar value to cents
    const dollarValue = getDollarValue(programId);
    return (dollarValue * 100).toFixed(2);
  };

  const getDollarValue = (programId) => {
    // Return custom value if set, otherwise default value
    if (customDollarValues && customDollarValues[programId] !== undefined) {
      return customDollarValues[programId];
    }
    return programs[programId]?.dollarValue || 0;
  };

  const updateCentsValue = (programId, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    // Convert cents to dollars
    const dollarValue = numValue / 100;
    
    const newCustomValues = { ...customDollarValues };
    newCustomValues[programId] = dollarValue;
    
    onCustomDollarValuesChange(newCustomValues);
    setStoredSettings(prev => ({ ...prev, customDollarValues: newCustomValues }));
  };

  const resetToDefault = (programId) => {
    const newCustomValues = { ...customDollarValues };
    delete newCustomValues[programId];
    
    onCustomDollarValuesChange(newCustomValues);
    setStoredSettings(prev => ({ ...prev, customDollarValues: newCustomValues }));
  };

  const resetAllToDefaults = () => {
    onCustomDollarValuesChange({});
    setStoredSettings(prev => ({ ...prev, customDollarValues: {} }));
  };


  return (
    <div className={styles.advancedSettings}>
      <div 
        className={styles.settingsHeader}
        onClick={toggleExpanded}
      >
        <h3 className={styles.settingsHeaderH3}>Advanced Settings</h3>
        <span className={styles.expandIcon}>{isExpanded ? '−' : '+'}</span>
      </div>
      
      {isExpanded && (
        <div className={styles.settingsContent}>
          <p className={styles.settingsDescription}>
            Customize the estimated cents per point value for each program. These values are used when "Show dollar values" is enabled.
          </p>
          
          <div className={styles.toggleRow}>
            <label className={styles.toggleLabel}>
              <input 
                type="checkbox" 
                checked={storedSettings.multiStepEnabled}
                onChange={handleMultiStepChange}
              />
              Show multi-step conversions (not recommended)
            </label>
          </div>
          
          <div className={styles.programGroups}>
            {Object.entries(groupedPrograms).map(([groupName, groupPrograms]) => (
              <div 
                key={groupName} 
                className={`${styles.programGroup} ${groupName === Object.keys(groupedPrograms)[Object.keys(groupedPrograms).length - 1] ? styles.programGroupLast : ''}`}
              >
                <h4 className={styles.groupTitle}>{getGroupDisplayName(groupName)}</h4>
                <table className={styles.programTable}>
                  <thead>
                    <tr>
                      <th className={styles.programTableTh}>Program</th>
                      <th className={`${styles.programTableTh} ${styles.centsColumn}`}>Cents/pt</th>
                      <th className={`${styles.programTableTh} ${styles.actionColumn}`}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupPrograms.map((program, index) => (
                      <tr 
                        key={program.id}
                        className={index % 2 === 1 ? styles.programTableTrEven : ''}
                      >
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
                            value={getCentsValue(program.id)}
                            onChange={(e) => updateCentsValue(program.id, e.target.value)}
                            className={styles.centsInput}
                          />
                          <span className={styles.centsSymbol}>¢</span>
                        </td>
                        <td className={styles.programTableTd}>
                          <button 
                            onClick={() => resetToDefault(program.id)}
                            className={styles.resetButton}
                            type="button"
                          >
                            Reset
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          
          <div className={styles.settingsActions}>
            <button 
              onClick={resetAllToDefaults} 
              className={styles.resetAllButton}
              type="button"
            >
              Reset All to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;