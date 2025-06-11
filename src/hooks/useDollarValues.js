export function useDollarValues() {
  
  // Format dollar amount for display
  const formatDollarValue = (amount, dollarValue) => {
    if (!dollarValue || !amount) return null
    
    const dollarAmount = amount * dollarValue
    
    if (dollarAmount < 1) {
      return `$${dollarAmount.toFixed(2)}`
    } else {
      return `$${Math.round(dollarAmount).toLocaleString()}`
    }
  }
  
  // Get dollar value for a program (with custom values support)
  const getProgramDollarValue = (programId, programs, customValues = {}) => {
    if (!programs || !programs[programId]) return null
    
    // Return custom value if set, otherwise default value
    if (customValues[programId] !== undefined) {
      return customValues[programId]
    }
    
    return programs[programId].dollarValue || null
  }
  
  // Format points with optional dollar value in parentheses
  const formatPointsWithDollar = (amount, programId, programs, showDollar = false, customValues = {}) => {
    const pointsText = amount.toLocaleString()
    
    if (!showDollar) return pointsText
    
    const dollarValue = getProgramDollarValue(programId, programs, customValues)
    if (!dollarValue) return pointsText
    
    const dollarText = formatDollarValue(amount, dollarValue)
    return `${pointsText} (${dollarText})`
  }
  
  return {
    formatDollarValue,
    getProgramDollarValue,
    formatPointsWithDollar
  }
}