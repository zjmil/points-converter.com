import styles from './ConversionResults.module.css';

const ConversionDetails = ({ results, multiStepEnabled, findMultiStepConversions }) => {
  if (!results?.directConversion) {
    if (results?.multiStepRoutes?.length > 0) {
      return (
        <div className={styles.conversionDetails}>
          <p>Consider these multi-step conversion routes:</p>
        </div>
      );
    } else {
      // Check if multi-step routes exist but are disabled
      const potentialMultiStepRoutes = findMultiStepConversions ? 
        findMultiStepConversions(results?.fromProgram, results?.toProgram) : [];
      
      if (potentialMultiStepRoutes.length > 0 && !multiStepEnabled) {
        return (
          <div className={styles.conversionDetails}>
            <p>Unfortunately, there is no direct conversion path between these programs.</p>
            <p>Enable "Show multi-step conversions" above to see 2-step conversion routes.</p>
          </div>
        );
      } else {
        return (
          <div className={styles.conversionDetails}>
            <p>Unfortunately, there is no direct or 2-step conversion path between these programs.</p>
          </div>
        );
      }
    }
  }
  
  const { directConversion, amount } = results;
  const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate;
  
  return (
    <div className={styles.conversionDetails}>
      <div>
        <p><strong>Exchange Rate:</strong> 1:{rate}</p>
        <p><strong>Transfer Type:</strong> {directConversion.instantTransfer ? 'Instant' : 'May take 1-2 days'}</p>
        
        {directConversion.minAmount && (
          amount < directConversion.minAmount ? (
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
    </div>
  );
};

export default ConversionDetails;