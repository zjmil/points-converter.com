import React, { useMemo } from 'react'
import ProgramSearch from './ProgramSearch'
import { useDollarValues } from '../hooks/useDollarValues'
import { useMediaQuery } from '../hooks/useMediaQuery'

function ConversionForm({
  fromProgram,
  onFromProgramChange,
  toProgram,
  onToProgramChange,
  amount,
  onAmountChange,
  programs,
  conversions,
  showDollarValues,
  customDollarValues
}) {
  const { formatDollarValue, getProgramDollarValue } = useDollarValues()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Calculate dollar value for current amount
  const amountDollarValue = useMemo(() => {
    if (!fromProgram || !amount || !programs) return null
    
    const dollarValue = getProgramDollarValue(fromProgram, programs, customDollarValues)
    if (!dollarValue) return null
    
    return formatDollarValue(amount, dollarValue)
  }, [fromProgram, amount, programs, customDollarValues, formatDollarValue, getProgramDollarValue])

  const styles = {
    conversionForm: {
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      flexWrap: 'wrap',
      marginBottom: '2rem',
      ...(isMobile && { flexDirection: 'column' })
    },
    formGroup: {
      flex: 1,
      minWidth: '150px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 500,
      color: '#555',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      transition: 'border-color 0.3s',
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#3498db',
    },
    dollarHint: {
      fontSize: '0.9rem',
      color: '#666',
      marginTop: '0.25rem',
      fontStyle: 'italic',
      minHeight: '1.2em',
    },
    arrow: {
      fontSize: '2rem',
      color: '#3498db',
      padding: '0 0.5rem',
      alignSelf: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60px', // Match approximate height of input + label
      marginTop: '1.5rem', // Account for label space
      ...(isMobile && {
        transform: 'rotate(90deg)',
        margin: '1rem 0',
        alignSelf: 'center',
        marginTop: '0'
      })
    }
  }

  return (
    <div style={styles.conversionForm}>
      <div style={styles.formGroup}>
        <label htmlFor="fromAmount" style={styles.label}>Amount</label>
        <input 
          id="fromAmount"
          type="number" 
          value={amount}
          onChange={(e) => onAmountChange(parseInt(e.target.value) || 0)}
          min="1"
          style={styles.input}
          onFocus={(e) => e.target.style.borderColor = '#3498db'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        {showDollarValues && fromProgram && amountDollarValue && (
          <div style={styles.dollarHint}>
            {amountDollarValue}
          </div>
        )}
      </div>

      <ProgramSearch
        value={fromProgram}
        onChange={onFromProgramChange}
        label="From"
        placeholder="Search or click to choose source program..."
        programs={programs}
        otherProgram={toProgram}
        isFromProgram={true}
      />

      <div style={styles.arrow}>→</div>

      <ProgramSearch
        value={toProgram}
        onChange={onToProgramChange}
        label="To"
        placeholder="Search or click to choose destination..."
        programs={programs}
        otherProgram={fromProgram}
        isFromProgram={false}
      />
    </div>
  )
}

export default ConversionForm