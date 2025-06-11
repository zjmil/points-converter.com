import React, { useMemo } from 'react';
import { useConversions } from '../hooks/useConversions';

const TransferPreview = ({ 
  fromProgram, 
  toProgram, 
  programs, 
  conversions, 
  onSelectTransfer 
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
      
      // Add two-step transfers
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
      
      // Add two-step transfers
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
    
    return transfers;
  }, [fromProgram, toProgram, programs, conversions, conversionData, getTransfersFrom, getTransfersTo]);

  const getTransferKey = (transfer) => {
    return `${transfer.title}-${transfer.rate}-${transfer.isDirect}`;
  };

  const selectTransfer = (transfer) => {
    // Determine which program to populate based on current selection
    if (fromProgram && !toProgram) {
      // From program is selected, populate to program
      const toProgram = transfer.transferData.to || transfer.transferData.steps?.[transfer.transferData.steps.length - 1]?.to;
      onSelectTransfer({ toProgram });
    } else if (!fromProgram && toProgram) {
      // To program is selected, populate from program  
      const fromProgram = transfer.transferData.from || transfer.transferData.steps?.[0]?.from;
      onSelectTransfer({ fromProgram });
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

  const styles = {
    transferPreview: {
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    title: {
      marginBottom: '1rem',
      color: '#2c3e50'
    },
    transferList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem'
    },
    transferItem: {
      border: '1px solid #e1e5e9',
      borderRadius: '8px',
      padding: '1rem',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    transferItemHover: {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)',
      borderColor: '#3498db'
    },
    transferItemHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    transferItemTitle: {
      fontWeight: '600',
      color: '#2c3e50',
      flex: '1'
    },
    transferItemRate: {
      fontSize: '0.9rem',
      color: '#7f8c8d'
    },
    transferItemDetails: {
      fontSize: '0.85rem',
      color: '#95a5a6'
    },
    transferItemNote: {
      marginTop: '0.5rem',
      padding: '0.5rem',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '4px',
      fontSize: '0.8rem',
      color: '#856404',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem'
    },
    transferItemNoteIcon: {
      flexShrink: '0',
      marginTop: '2px',
      color: '#f39c12'
    },
    transferItemSource: {
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '0.75rem'
    },
    transferItemSourceLink: {
      color: '#3498db',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'color 0.2s ease'
    },
    transferItemUpdated: {
      color: '#7f8c8d',
      fontStyle: 'italic'
    },
    noTransfers: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      color: '#7f8c8d',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={styles.transferPreview}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.transferList}>
        {allTransfers.map(transfer => (
          <div 
            key={getTransferKey(transfer)}
            style={styles.transferItem}
            onClick={() => selectTransfer(transfer)}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.transferItemHover);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, styles.transferItem);
            }}
          >
            <div style={styles.transferItemHeader}>
              <div style={styles.transferItemTitle}>{transfer.title}</div>
              <div style={styles.transferItemRate}>1:{transfer.rate}</div>
            </div>
            <div style={styles.transferItemDetails}>{transfer.details}</div>
            {transfer.note && (
              <div style={styles.transferItemNote}>
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
                  style={styles.transferItemNoteIcon}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                {transfer.note}
              </div>
            )}
            {transfer.source && (
              <div style={styles.transferItemSource}>
                <a 
                  href={transfer.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.transferItemSourceLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2980b9';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#3498db';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
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
                  <span style={styles.transferItemUpdated}>
                    Updated: {formatDate(transfer.lastUpdated)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {allTransfers.length === 0 && (
          <p style={styles.noTransfers}>
            No transfers available
          </p>
        )}
      </div>
    </div>
  );
};

export default TransferPreview;