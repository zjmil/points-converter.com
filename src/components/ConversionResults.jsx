import React, { useState, useMemo } from 'react';
import { useDollarValues } from '../hooks/useDollarValues';
import ProgramIcon from './ProgramIcon';

const ConversionResults = ({ results, showDollarValues, customDollarValues }) => {
  const { formatPointsWithDollar } = useDollarValues();
  
  // Track which routes are expanded
  const [expandedRoutes, setExpandedRoutes] = useState(new Set());
  
  // Toggle route details
  const toggleRouteDetails = (index) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRoutes(newExpanded);
  };
  
  const conversionPath = useMemo(() => {
    if (!results) return '';
    
    const { amount, directConversion, multiStepRoutes, programs, fromProgram, toProgram } = results;
    const fromName = programs[fromProgram]?.name || '';
    const toName = programs[toProgram]?.name || '';
    
    if (directConversion) {
      const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate;
      const result = Math.floor(amount * rate);
      
      const fromText = formatPointsWithDollar(amount, fromProgram, programs, showDollarValues, customDollarValues);
      const toText = formatPointsWithDollar(result, toProgram, programs, showDollarValues, customDollarValues);
      
      return `${fromText} ${fromName} → ${toText} ${toName}`;
    } else if (multiStepRoutes.length > 0) {
      return 'No direct conversion available';
    } else {
      return 'No conversion path found';
    }
  }, [results, showDollarValues, customDollarValues, formatPointsWithDollar]);
  
  // Mobile version with short names for space constraints
  const conversionPathMobile = useMemo(() => {
    if (!results) return '';
    
    const { amount, directConversion, multiStepRoutes, programs, fromProgram, toProgram } = results;
    const fromShortName = programs[fromProgram]?.shortName || programs[fromProgram]?.name || '';
    const toShortName = programs[toProgram]?.shortName || programs[toProgram]?.name || '';
    
    if (directConversion) {
      const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate;
      const result = Math.floor(amount * rate);
      
      const fromText = formatPointsWithDollar(amount, fromProgram, programs, showDollarValues, customDollarValues);
      const toText = formatPointsWithDollar(result, toProgram, programs, showDollarValues, customDollarValues);
      
      return `${fromText} ${fromShortName} → ${toText} ${toShortName}`;
    } else if (multiStepRoutes.length > 0) {
      return 'No direct conversion available';
    } else {
      return 'No conversion path found';
    }
  }, [results, showDollarValues, customDollarValues, formatPointsWithDollar]);
  
  const renderConversionDetails = () => {
    if (!results?.directConversion) {
      if (results?.multiStepRoutes?.length > 0) {
        return <p>Consider these multi-step conversion routes:</p>;
      } else {
        return <p>Unfortunately, there is no direct or 2-step conversion path between these programs.</p>;
      }
    }
    
    const { directConversion } = results;
    const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate;
    
    return (
      <div>
        <p><strong>Exchange Rate:</strong> 1:{rate}</p>
        <p><strong>Transfer Type:</strong> {directConversion.instantTransfer ? 'Instant' : 'May take 1-2 days'}</p>
        
        {directConversion.minAmount && (
          results.amount < directConversion.minAmount ? (
            <p style={styles.warningInfo}>
              <span style={styles.warningIcon}>⚠️</span>
              Minimum transfer amount: {directConversion.minAmount.toLocaleString()} points
            </p>
          ) : (
            <p><strong>Minimum Amount:</strong> {directConversion.minAmount.toLocaleString()} points</p>
          )
        )}
        
        {directConversion.lastUpdated && (
          <p><strong>Last Updated:</strong> {new Date(directConversion.lastUpdated).toLocaleDateString()}</p>
        )}
        
        {directConversion.bonus && (
          <p style={styles.bonusInfo}>
            <span style={styles.bonusIndicator}>BONUS ACTIVE</span>
            {' '}Regular rate: 1:{directConversion.rate} → Bonus rate: 1:{directConversion.bonusRate}
            {directConversion.bonusEndDate && (
              <span> (Ends {new Date(directConversion.bonusEndDate).toLocaleDateString()})</span>
            )}
          </p>
        )}
        
        {directConversion.note && (
          <p><strong>Note:</strong> {directConversion.note}</p>
        )}
      </div>
    );
  };
  
  const hasAlternatives = useMemo(() => {
    if (!results) return false;
    
    const { directConversion, multiStepRoutes } = results;
    
    // Show alternatives if we have a direct conversion AND multi-step routes
    // OR if we only have multi-step routes (no direct conversion)
    return (directConversion && multiStepRoutes.length > 0) || 
           (!directConversion && multiStepRoutes.length > 0);
  }, [results]);
  
  const alternativeTitle = useMemo(() => {
    if (!results) return '';
    
    const { directConversion, multiStepRoutes } = results;
    
    if (directConversion && multiStepRoutes.length > 0) {
      return 'Alternative Routes';
    } else if (!directConversion && multiStepRoutes.length > 0) {
      return 'Available Routes';
    }
    
    return 'Routes';
  }, [results]);
  
  const displayRoutes = useMemo(() => {
    if (!results?.multiStepRoutes) return [];
    
    const { amount, multiStepRoutes, programs, toProgram } = results;
    const toName = programs[toProgram]?.name || '';
    
    return multiStepRoutes.map((route, index) => {
      const result = Math.floor(amount * route.totalRate);
      const isAlternative = results.directConversion;
      const isExpanded = expandedRoutes.has(index);
      
      const resultText = formatPointsWithDollar(result, toProgram, programs, showDollarValues, customDollarValues);
      const title = isAlternative 
        ? `Alternative ${index + 1}: ${resultText} ${toName}`
        : `Route ${index + 1}: ${resultText} ${toName}`;
      
      let currentAmount = amount;
      const steps = route.steps.map(step => {
        const stepRate = step.bonus ? step.bonusRate : step.rate;
        const stepResult = Math.floor(currentAmount * stepRate);
        const stepFromName = programs[step.from]?.name || '';
        const stepToName = programs[step.to]?.name || '';
        
        const fromText = formatPointsWithDollar(currentAmount, step.from, programs, showDollarValues, customDollarValues);
        const toText = formatPointsWithDollar(stepResult, step.to, programs, showDollarValues, customDollarValues);
        
        const text = `${fromText} ${stepFromName} → ${toText} ${stepToName} (1:${stepRate})`;
        
        currentAmount = stepResult;
        
        return {
          text,
          hasBonus: step.bonus
        };
      });
      
      // Create detailed step information for expanded view
      const stepDetails = route.steps.map(step => ({
        rate: step.bonus ? step.bonusRate : step.rate,
        baseRate: step.rate,
        bonusRate: step.bonusRate,
        bonus: step.bonus,
        bonusEndDate: step.bonusEndDate,
        instantTransfer: step.instantTransfer,
        minAmount: step.minAmount,
        lastUpdated: step.lastUpdated,
        note: step.note
      }));
      
      return {
        title,
        steps,
        stepDetails,
        totalRate: route.totalRate.toFixed(2),
        isExpanded
      };
    });
  }, [results, expandedRoutes, showDollarValues, customDollarValues, formatPointsWithDollar]);

  return (
    <div style={styles.results}>
      <h2>Conversion Results</h2>
      
      <div style={styles.conversionPath}>
        {(results?.directConversion || results?.multiStepRoutes?.length > 0) ? (
          <span style={styles.conversionVisual}>
            {results.fromProgram && (
              <ProgramIcon 
                programId={results.fromProgram}
                type={results.programs?.[results.fromProgram]?.type}
                size="medium"
              />
            )}
            <span style={styles.desktopPath}>{conversionPath}</span>
            <span style={styles.mobilePath}>{conversionPathMobile}</span>
            {results.toProgram && (
              <ProgramIcon 
                programId={results.toProgram}
                type={results.programs?.[results.toProgram]?.type}
                size="medium"
              />
            )}
          </span>
        ) : (
          <span>{conversionPath}</span>
        )}
      </div>
      
      <div style={styles.conversionDetails}>
        {renderConversionDetails()}
      </div>
      
      {/* Multi-step alternatives */}
      {hasAlternatives && (
        <div style={styles.multiStep}>
          <h3>{alternativeTitle}</h3>
          <div style={styles.alternativeRoutes}>
            {displayRoutes.map((route, index) => (
              <div 
                key={index}
                style={{
                  ...styles.conversionStep,
                  ...(route.isExpanded ? styles.expanded : styles.clickable)
                }}
                onClick={() => toggleRouteDetails(index)}
              >
                <h4 style={styles.stepHeader}>
                  {route.title}
                  <span style={styles.expandIcon}>
                    {route.isExpanded ? '−' : '+'}
                  </span>
                </h4>
                
                {!route.isExpanded ? (
                  <div style={styles.routeSummary}>
                    <p><strong>Total Rate:</strong> 1:{route.totalRate}</p>
                    <p style={styles.clickHint}>Click for details</p>
                  </div>
                ) : (
                  <div style={styles.routeDetails}>
                    <ol style={styles.stepsList}>
                      {route.steps.map((step, stepIndex) => (
                        <li key={stepIndex} style={styles.stepItem}>
                          {step.text}
                          {step.hasBonus && (
                            <span style={styles.bonusIndicator}>BONUS</span>
                          )}
                        </li>
                      ))}
                    </ol>
                    
                    <div style={styles.stepDetails}>
                      <p><strong>Total Rate:</strong> 1:{route.totalRate}</p>
                      {route.stepDetails.map((step, stepIndex) => (
                        <div key={stepIndex} style={styles.stepInfo}>
                          <p><strong>Step {stepIndex + 1}:</strong></p>
                          <ul style={styles.stepInfoList}>
                            <li><strong>Exchange Rate:</strong> 1:{step.rate}</li>
                            <li><strong>Transfer Type:</strong> {step.instantTransfer ? 'Instant' : 'May take 1-2 days'}</li>
                            {step.minAmount && (
                              <li><strong>Minimum Amount:</strong> {step.minAmount.toLocaleString()} points</li>
                            )}
                            {step.lastUpdated && (
                              <li><strong>Last Updated:</strong> {new Date(step.lastUpdated).toLocaleDateString()}</li>
                            )}
                            {step.bonus && (
                              <li style={styles.bonusInfo}>
                                <span style={styles.bonusIndicator}>BONUS ACTIVE</span>
                                Regular rate: 1:{step.baseRate} → Bonus rate: 1:{step.bonusRate}
                                {step.bonusEndDate && (
                                  <span> (Ends {new Date(step.bonusEndDate).toLocaleDateString()})</span>
                                )}
                              </li>
                            )}
                            {step.note && (
                              <li><strong>Note:</strong> {step.note}</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Inline styles converted from CSS
const styles = {
  results: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  conversionPath: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: '1rem'
  },
  conversionVisual: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  mobilePath: {
    display: 'none'
  },
  desktopPath: {
    display: 'inline'
  },
  conversionDetails: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '8px',
    borderLeft: '4px solid #3498db',
    marginBottom: '1rem'
  },
  multiStep: {
    marginTop: '2rem'
  },
  alternativeRoutes: {},
  conversionStep: {
    padding: '1rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '3px solid #e74c3c',
    transition: 'all 0.3s ease'
  },
  clickable: {
    cursor: 'pointer',
    borderLeft: '3px solid #3498db'
  },
  expanded: {
    borderLeft: '3px solid #27ae60',
    backgroundColor: '#f0f8f0'
  },
  stepHeader: {
    marginBottom: '0.5rem',
    color: '#2c3e50',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  expandIcon: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#3498db'
  },
  routeSummary: {
    margin: '0.5rem 0'
  },
  clickHint: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    margin: '0.25rem 0 0 0'
  },
  routeDetails: {
    marginTop: '1rem'
  },
  stepsList: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem'
  },
  stepItem: {
    marginBottom: '0.25rem'
  },
  stepDetails: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #dee2e6'
  },
  stepInfo: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #dee2e6'
  },
  stepInfoList: {
    margin: '0.5rem 0 0 0',
    paddingLeft: '1.25rem'
  },
  bonusIndicator: {
    display: 'inline-block',
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    marginLeft: '0.5rem'
  },
  bonusInfo: {
    backgroundColor: '#e8f5e8',
    padding: '0.5rem',
    borderRadius: '4px',
    borderLeft: '3px solid #27ae60',
    marginTop: '0.5rem'
  },
  warningInfo: {
    backgroundColor: '#fff3cd',
    padding: '0.5rem',
    borderRadius: '4px',
    borderLeft: '3px solid #ffc107',
    marginTop: '0.5rem',
    color: '#856404'
  },
  warningIcon: {
    marginRight: '0.5rem'
  }
};

// Note: For full responsive behavior, you would need to implement CSS media queries
// either through CSS modules, styled-components, or a CSS-in-JS solution.
// The mobile/desktop path switching would be handled via CSS:
// @media (max-width: 768px) {
//   .desktop-path { display: none; }
//   .mobile-path { display: inline; }
//   .conversion-path { font-size: 1.2rem; }
// }

export default ConversionResults;