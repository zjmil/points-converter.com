import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

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

  const styles = {
    advancedSettings: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      overflow: 'hidden'
    },
    settingsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      background: '#f8f9fa',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      userSelect: 'none'
    },
    settingsHeaderHover: {
      background: '#e9ecef'
    },
    settingsHeaderH3: {
      margin: 0,
      color: '#2c3e50',
      fontSize: '1.1rem'
    },
    expandIcon: {
      fontWeight: 'bold',
      fontSize: '1.2rem',
      color: '#3498db'
    },
    settingsContent: {
      padding: '1.5rem'
    },
    settingsDescription: {
      margin: '0 0 1.5rem 0',
      color: '#666',
      fontSize: '0.9rem',
      lineHeight: '1.4'
    },
    toggleRow: {
      marginBottom: '1.5rem'
    },
    toggleLabel: {
      fontWeight: '500',
      color: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer'
    },
    programGroups: {
      marginBottom: '1.5rem'
    },
    programGroup: {
      marginBottom: '2rem'
    },
    programGroupLast: {
      marginBottom: 0
    },
    groupTitle: {
      margin: '0 0 1rem 0',
      color: '#495057',
      fontSize: '1rem',
      fontWeight: '600',
      borderBottom: '2px solid #dee2e6',
      paddingBottom: '0.5rem'
    },
    programTable: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#f8f9fa',
      borderRadius: '6px',
      overflow: 'hidden',
      marginBottom: '0.5rem'
    },
    programTableTh: {
      padding: '0.5rem 0.75rem',
      textAlign: 'left',
      background: '#e9ecef',
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#495057'
    },
    programTableTd: {
      padding: '0.5rem 0.75rem',
      textAlign: 'left'
    },
    programTableTrEven: {
      background: '#f4f6f8'
    },
    programLabel: {
      fontWeight: '500',
      color: '#2c3e50'
    },
    centsInput: {
      width: '70px',
      padding: '0.4rem 1.5rem 0.4rem 0.5rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '0.9rem',
      textAlign: 'right',
      WebkitAppearance: 'none',
      MozAppearance: 'textfield',
      appearance: 'textfield'
    },
    centsSymbol: {
      marginLeft: '0.2rem',
      color: '#666',
      fontWeight: '500',
      fontSize: '0.95em',
      verticalAlign: 'middle'
    },
    resetButton: {
      padding: '0.2rem 0.7rem',
      background: '#e9ecef',
      border: 'none',
      borderRadius: '4px',
      color: '#495057',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      whiteSpace: 'nowrap',
      alignSelf: 'center'
    },
    resetButtonHover: {
      background: '#dee2e6'
    },
    settingsActions: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '2rem'
    },
    resetAllButton: {
      padding: '0.75rem 1.5rem',
      background: '#e9ecef',
      border: 'none',
      borderRadius: '4px',
      color: '#495057',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    resetAllButtonHover: {
      background: '#dee2e6'
    }
  };

  return (
    <div style={styles.advancedSettings}>
      <div 
        style={styles.settingsHeader}
        onClick={toggleExpanded}
        onMouseEnter={(e) => e.target.style.background = '#e9ecef'}
        onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
      >
        <h3 style={styles.settingsHeaderH3}>Advanced Settings</h3>
        <span style={styles.expandIcon}>{isExpanded ? '−' : '+'}</span>
      </div>
      
      {isExpanded && (
        <div style={styles.settingsContent}>
          <p style={styles.settingsDescription}>
            Customize the estimated cents per point value for each program. These values are used when "Show dollar values" is enabled.
          </p>
          
          <div style={styles.toggleRow}>
            <label style={styles.toggleLabel}>
              <input 
                type="checkbox" 
                checked={storedSettings.multiStepEnabled}
                onChange={handleMultiStepChange}
              />
              Show multi-step conversions (not recommended)
            </label>
          </div>
          
          <div style={styles.programGroups}>
            {Object.entries(groupedPrograms).map(([groupName, groupPrograms]) => (
              <div 
                key={groupName} 
                style={groupName === Object.keys(groupedPrograms)[Object.keys(groupedPrograms).length - 1] 
                  ? { ...styles.programGroup, ...styles.programGroupLast } 
                  : styles.programGroup
                }
              >
                <h4 style={styles.groupTitle}>{getGroupDisplayName(groupName)}</h4>
                <table style={styles.programTable}>
                  <thead>
                    <tr>
                      <th style={styles.programTableTh}>Program</th>
                      <th style={{ ...styles.programTableTh, width: '120px' }}>Cents/pt</th>
                      <th style={{ ...styles.programTableTh, width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupPrograms.map((program, index) => (
                      <tr 
                        key={program.id}
                        style={index % 2 === 1 ? styles.programTableTrEven : {}}
                      >
                        <td style={{ ...styles.programTableTd, ...styles.programLabel }}>
                          {program.name}
                        </td>
                        <td style={styles.programTableTd}>
                          <input
                            id={`cents-${program.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={getCentsValue(program.id)}
                            onChange={(e) => updateCentsValue(program.id, e.target.value)}
                            style={styles.centsInput}
                          />
                          <span style={styles.centsSymbol}>¢</span>
                        </td>
                        <td style={styles.programTableTd}>
                          <button 
                            onClick={() => resetToDefault(program.id)}
                            style={styles.resetButton}
                            type="button"
                            onMouseEnter={(e) => e.target.style.background = '#dee2e6'}
                            onMouseLeave={(e) => e.target.style.background = '#e9ecef'}
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
          
          <div style={styles.settingsActions}>
            <button 
              onClick={resetAllToDefaults} 
              style={styles.resetAllButton}
              type="button"
              onMouseEnter={(e) => e.target.style.background = '#dee2e6'}
              onMouseLeave={(e) => e.target.style.background = '#e9ecef'}
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