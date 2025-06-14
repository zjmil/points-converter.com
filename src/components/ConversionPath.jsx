import { useMemo } from 'react';
import { useDollarValues } from '../hooks/useDollarValues';
import ProgramIcon from './ProgramIcon';
import styles from './ConversionResults.module.css';

const ConversionPath = ({ results, showDollarValues, customDollarValues }) => {
  const { formatPointsWithDollar } = useDollarValues();
  
  const { desktopPath, mobilePath } = useMemo(() => {
    if (!results) return { desktopPath: '', mobilePath: '' };
    
    const { amount, directConversion, multiStepRoutes, programs, fromProgram, toProgram } = results;
    const fromName = programs[fromProgram]?.name || '';
    const toName = programs[toProgram]?.name || '';
    
    if (directConversion) {
      const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate;
      const result = Math.floor(amount * rate);
      
      const fromText = formatPointsWithDollar(amount, fromProgram, programs, showDollarValues, customDollarValues);
      const toText = formatPointsWithDollar(result, toProgram, programs, showDollarValues, customDollarValues);
      
      const desktopPath = `${fromText} ${fromName} → ${toText} ${toName}`;
      
      // Mobile version with short names
      const fromShortName = programs[fromProgram]?.shortName || fromName;
      const toShortName = programs[toProgram]?.shortName || toName;
      const mobilePath = `${fromText} ${fromShortName} → ${toText} ${toShortName}`;
      
      return { desktopPath, mobilePath };
    } else if (multiStepRoutes.length > 0) {
      return { 
        desktopPath: 'No direct conversion available',
        mobilePath: 'No direct conversion available'
      };
    } else {
      return { 
        desktopPath: 'No conversion path found',
        mobilePath: 'No conversion path found'
      };
    }
  }, [results, showDollarValues, customDollarValues, formatPointsWithDollar]);
  
  const hasValidConversion = results?.directConversion || results?.multiStepRoutes?.length > 0;
  
  return (
    <div className={styles.conversionPath}>
      {hasValidConversion ? (
        <span className={styles.conversionVisual}>
          {results.fromProgram && (
            <ProgramIcon 
              programId={results.fromProgram}
              type={results.programs?.[results.fromProgram]?.type}
              size="medium"
            />
          )}
          <span className={styles.desktopPath}>{desktopPath}</span>
          <span className={styles.mobilePath}>{mobilePath}</span>
          {results.toProgram && (
            <ProgramIcon 
              programId={results.toProgram}
              type={results.programs?.[results.toProgram]?.type}
              size="medium"
            />
          )}
        </span>
      ) : (
        <span>{desktopPath}</span>
      )}
    </div>
  );
};

export default ConversionPath;