import { useState, useMemo } from 'react';
import { useSettingsStorage } from '../hooks/useSettingsStorage';
import ProgramValueEditor from './ProgramValueEditor';
import styles from './AdvancedSettings.module.css';

const AdvancedSettings = ({ programs, customDollarValues, onCustomDollarValuesChange, onMultiStepEnabledChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    storedSettings,
    updateCustomDollarValues,
    updateMultiStepEnabled,
    resetAllToDefaults
  } = useSettingsStorage(onCustomDollarValuesChange, onMultiStepEnabledChange);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMultiStepChange = (e) => {
    updateMultiStepEnabled(e.target.checked);
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

  const updateProgramValue = (programId, dollarValue) => {
    const newCustomValues = { ...customDollarValues };
    newCustomValues[programId] = dollarValue;
    updateCustomDollarValues(newCustomValues);
  };

  const resetProgramValue = (programId) => {
    const newCustomValues = { ...customDollarValues };
    delete newCustomValues[programId];
    updateCustomDollarValues(newCustomValues);
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
                      <ProgramValueEditor
                        key={program.id}
                        program={program}
                        index={index}
                        customDollarValues={customDollarValues}
                        onUpdateValue={updateProgramValue}
                        onReset={resetProgramValue}
                      />
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