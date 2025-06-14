import React, { useMemo } from 'react';
import { useConversions } from '../contexts/ConversionContext';
import styles from './TransferPreview.module.css';

const TransferPreview = ({ 
  fromProgram, 
  toProgram, 
  programs, 
  conversions, 
  onSelectTransfer,
  multiStepEnabled = false
}) => {
  const { getTransfersFrom, getTransfersTo, conversionData } = useConversions();

  const title = useMemo(() => {
    const programsData = conversionData?.programs || programs;
    if (fromProgram && !toProgram) {
      const programName = programsData?.[fromProgram]?.name || '';
      return `Transfer ${programName} points to:`;
    } else if (!fromProgram && toProgram) {
      const programName = programsData?.[toProgram]?.name || '';
      return `Transfer points to ${programName} from:`;
    }
    return 'Available Transfers';
  }, [fromProgram, toProgram, programs, conversionData]);

  const allTransfers = useMemo(() => {
    const programsData = conversionData?.programs || programs;
    if (!programsData) return [];
    
    const transfers = [];
    
    if (fromProgram && !toProgram) {
      // Show transfers FROM the selected program
      const { direct, twoStep } = getTransfersFrom(fromProgram);
      
      // Add direct transfers
      direct.forEach(transfer => {
        const targetProgram = programsData[transfer.to]?.name || '';
        const rate = transfer.bonus ? transfer.bonusRate : transfer.rate;
        
        const details = [];
        details.push(`Rate: 1:${rate}`);
        details.push(transfer.instantTransfer ? 'Instant' : '1-2 days');
        
        if (transfer.bonus) {
          details.push('BONUS ACTIVE');
        }
        
        transfers.push({
          title: targetProgram,
          rate: rate,
          details: details.join(' • '),
          note: transfer.note,
          source: transfer.source,
          lastUpdated: transfer.lastUpdated,
          isDirect: true,
          transferData: transfer
        });
      });
      
      // Add two-step transfers only if multi-step is enabled
      if (multiStepEnabled) {
        twoStep.forEach(transfer => {
          const targetProgram = programsData[transfer.to]?.name || '';
          const rate = transfer.totalRate.toFixed(2);
          
          const step1From = programsData[transfer.steps[0].from]?.name || '';
          const step1To = programsData[transfer.steps[0].to]?.name || '';
          const step2To = programsData[transfer.steps[1].to]?.name || '';
          
          const details = [];
          details.push(`Rate: 1:${rate} (2 steps)`);
          details.push(`Via: ${step1From} → ${step1To} → ${step2To}`);
          
          transfers.push({
            title: targetProgram,
            rate: rate,
            details: details.join(' • '),
            isDirect: false,
            transferData: transfer
          });
        });
      }
      
    } else if (!fromProgram && toProgram) {
      // Show transfers TO the selected program
      const { direct, twoStep } = getTransfersTo(toProgram);
      
      // Add direct transfers
      direct.forEach(transfer => {
        const sourceProgram = programsData[transfer.from]?.name || '';
        const rate = transfer.bonus ? transfer.bonusRate : transfer.rate;
        
        const details = [];
        details.push(`Rate: 1:${rate}`);
        details.push(transfer.instantTransfer ? 'Instant' : '1-2 days');
        
        if (transfer.bonus) {
          details.push('BONUS ACTIVE');
        }
        
        transfers.push({
          title: sourceProgram,
          rate: rate,
          details: details.join(' • '),
          note: transfer.note,
          source: transfer.source,
          lastUpdated: transfer.lastUpdated,
          isDirect: true,
          transferData: transfer
        });
      });
      
      // Add two-step transfers only if multi-step is enabled
      if (multiStepEnabled) {
        twoStep.forEach(transfer => {
          const sourceProgram = programsData[transfer.from]?.name || '';
          const rate = transfer.totalRate.toFixed(2);
          
          const step1From = programsData[transfer.steps[0].from]?.name || '';
          const step1To = programsData[transfer.steps[0].to]?.name || '';
          const step2To = programsData[transfer.steps[1].to]?.name || '';
          
          const details = [];
          details.push(`Rate: 1:${rate} (2 steps)`);
          details.push(`Via: ${step1From} → ${step1To} → ${step2To}`);
          
          transfers.push({
            title: sourceProgram,
            rate: rate,
            details: details.join(' • '),
            isDirect: false,
            transferData: transfer
          });
        });
      }
    }
    
    return transfers;
  }, [fromProgram, toProgram, programs, conversions, conversionData, getTransfersFrom, getTransfersTo, multiStepEnabled]);

  const getTransferKey = (transfer) => {
    return `${transfer.title}-${transfer.rate}-${transfer.isDirect}`;
  };

  const selectTransfer = (transfer) => {
    // Determine which program to populate based on current selection
    if (fromProgram && !toProgram) {
      // From program is selected, populate to program
      let toProgramId;
      if (transfer.isDirect) {
        toProgramId = transfer.transferData.to;
      } else {
        // For multi-step transfers, get the final destination
        toProgramId = transfer.transferData.to || transfer.transferData.steps?.[transfer.transferData.steps.length - 1]?.to;
      }
      onSelectTransfer({ toProgram: toProgramId, isUserAction: true });
    } else if (!fromProgram && toProgram) {
      // To program is selected, populate from program  
      let fromProgramId;
      if (transfer.isDirect) {
        fromProgramId = transfer.transferData.from;
      } else {
        // For multi-step transfers, get the initial source
        fromProgramId = transfer.transferData.from || transfer.transferData.steps?.[0]?.from;
      }
      onSelectTransfer({ fromProgram: fromProgramId, isUserAction: true });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };


  return (
    <div className={styles.transferPreview}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.transferList}>
        {allTransfers.map(transfer => (
          <div 
            key={getTransferKey(transfer)}
            className={styles.transferItem}
            onClick={() => selectTransfer(transfer)}
          >
            <div className={styles.transferItemHeader}>
              <div className={styles.transferItemTitle}>{transfer.title}</div>
              <div className={styles.transferItemRate}>1:{transfer.rate}</div>
            </div>
            <div className={styles.transferItemDetails}>{transfer.details}</div>
            {transfer.note && (
              <div className={styles.transferItemNote}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={styles.transferItemNoteIcon}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                {transfer.note}
              </div>
            )}
            {transfer.source && (
              <div className={styles.transferItemSource}>
                <a 
                  href={transfer.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.transferItemSourceLink}
                >
                  View source
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
                {transfer.lastUpdated && (
                  <span className={styles.transferItemUpdated}>
                    Updated: {formatDate(transfer.lastUpdated)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {allTransfers.length === 0 && (
          <p className={styles.noTransfers}>
            No transfers available
          </p>
        )}
      </div>
    </div>
  );
};

export default TransferPreview;