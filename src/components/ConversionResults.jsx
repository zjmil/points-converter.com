import { useState, useMemo } from 'react';
import { useDollarValues } from '../hooks/useDollarValues';
import { useConversions } from '../contexts/ConversionContext';
import ConversionPath from './ConversionPath';
import ConversionDetails from './ConversionDetails';
import styles from './ConversionResults.module.css';

const ConversionResults = ({ results, showDollarValues, customDollarValues, multiStepEnabled }) => {
  const { formatPointsWithDollar } = useDollarValues();
  const { findMultiStepConversions } = useConversions();
  
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
        note: step.note,
        from: step.from,
        to: step.to
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
      
      <ConversionPath 
        results={results}
        showDollarValues={showDollarValues}
        customDollarValues={customDollarValues}
      />
      
      <ConversionDetails 
        results={results} 
        multiStepEnabled={multiStepEnabled}
        findMultiStepConversions={findMultiStepConversions}
      />
      
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
                        <li key={stepIndex} className={styles.stepItem}>
                          {step.text}
                          {step.hasBonus && (
                            <span className={styles.bonusIndicator}>BONUS</span>
                          )}
                        </li>
                      ))}
                    </ol>
                    
                    <div className={styles.stepDetails}>
                      <p><strong>Total Rate:</strong> 1:{route.totalRate}</p>
                      {route.stepDetails.map((step, stepIndex) => {
                        const fromName = step.from ? (results?.programs?.[step.from]?.name || '') : '';
                        const toName = step.to ? (results?.programs?.[step.to]?.name || '') : '';
                        const stepLabel = fromName && toName ? `${fromName} → ${toName}` : `Step ${stepIndex + 1}`;
                        
                        return (
                        <div key={stepIndex} className={styles.stepInfo}>
                          <p><strong>Step {stepIndex + 1}: {stepLabel}</strong></p>
                          <ul className={styles.stepInfoList}>
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
                        )
                      })}
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