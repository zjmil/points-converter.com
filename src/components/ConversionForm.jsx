import { useMemo } from 'react'
import ProgramSearch from './ProgramSearch'
import { useDollarValues } from '../hooks/useDollarValues'
import styles from './ConversionForm.module.css'

function ConversionForm({
  fromProgram,
  onFromProgramChange,
  toProgram,
  onToProgramChange,
  amount,
  onAmountChange,
  programs,
  showDollarValues,
  customDollarValues
}) {
  const { formatDollarValue, getProgramDollarValue } = useDollarValues()

  // Calculate dollar value for current amount
  const amountDollarValue = useMemo(() => {
    if (!fromProgram || !amount || !programs) return null
    
    const dollarValue = getProgramDollarValue(fromProgram, programs, customDollarValues)
    if (!dollarValue) return null
    
    return formatDollarValue(amount, dollarValue)
  }, [fromProgram, amount, programs, customDollarValues, formatDollarValue, getProgramDollarValue])


  return (
    <div className={styles.conversionForm}>
      <div className={styles.formGroup}>
        <label htmlFor="fromAmount" className={styles.label}>Amount</label>
        <input 
          id="fromAmount"
          type="number" 
          value={amount}
          onChange={(e) => onAmountChange(parseInt(e.target.value) || 0)}
          min="1"
          className={styles.input}
        />
        {showDollarValues && fromProgram && amountDollarValue && (
          <div className={styles.dollarHint}>
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

      <div className={styles.arrow}>→</div>

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