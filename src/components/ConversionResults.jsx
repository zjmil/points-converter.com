import React, { useState, useMemo } from 'react';
import { useDollarValues } from '../hooks/useDollarValues';
import ProgramIcon from './ProgramIcon';
import styles from './ConversionResults.module.css';

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
            <p className={styles.warningInfo}>
              <span className={styles.warningIcon}>⚠️</span>
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
          <p className={styles.bonusInfo}>
            <span className={styles.bonusIndicator}>BONUS ACTIVE</span>
            {' '}Regular rate: 1:{directConversion.rate} → Bonus rate: 1:{directConversion.bonusRate}
            {directConversion.bonusEndDate && (
              <span> (Ends {new Date(directConversion.bonusEndDate).toLocaleDateString()})</span>
            )}
          </p>
        )}
        
        {directConversion.note && (
          <p><strong>Note:</strong> {directConversion.note}</p>
        )}
        
        {directConversion.source && (
          <p>
            <strong>Source:</strong>{' '}
            <a 
              href={directConversion.source} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.sourceLink}
            >
              Official program website
            </a>
          </p>
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
    <div className={styles.results}>
      <h2>Conversion Results</h2>
      
      <div className={styles.conversionPath}>
        {(results?.directConversion || results?.multiStepRoutes?.length > 0) ? (
          <span className={styles.conversionVisual}>
            {results.fromProgram && (
              <ProgramIcon 
                programId={results.fromProgram}
                type={results.programs?.[results.fromProgram]?.type}
                size="medium"
              />
            )}
            <span className={styles.desktopPath}>{conversionPath}</span>
            <span className={styles.mobilePath}>{conversionPathMobile}</span>
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
      
      <div className={styles.conversionDetails}>
        {renderConversionDetails()}
      </div>
      
      {/* Multi-step alternatives */}
      {hasAlternatives && (
        <div className={styles.multiStep}>
          <h3>{alternativeTitle}</h3>
          <div className={styles.alternativeRoutes}>
            {displayRoutes.map((route, index) => (
              <div 
                key={index}
                className={`${styles.conversionStep} ${route.isExpanded ? styles.expanded : styles.clickable}`}
                onClick={() => toggleRouteDetails(index)}
              >
                <h4 className={styles.stepHeader}>
                  {route.title}
                  <span className={styles.expandIcon}>
                    {route.isExpanded ? '−' : '+'}
                  </span>
                </h4>
                
                {!route.isExpanded ? (
                  <div className={styles.routeSummary}>
                    <p><strong>Total Rate:</strong> 1:{route.totalRate}</p>
                    <p className={styles.clickHint}>Click for details</p>
                  </div>
                ) : (
                  <div className={styles.routeDetails}>
                    <ol className={styles.stepsList}>
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
                              <li className={styles.bonusInfo}>
                                <span className={styles.bonusIndicator}>BONUS ACTIVE</span>
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


export default ConversionResults;