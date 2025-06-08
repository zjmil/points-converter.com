import { ref } from 'vue'

// Global shared state
const conversionData = ref(null)

export function useConversions() {
  
  const loadConversionData = async () => {
    try {
      const response = await fetch('/data/conversions.json')
      conversionData.value = await response.json()
    } catch (error) {
      console.error('Error loading conversion data:', error)
      alert('Error loading conversion data. Please refresh the page.')
    }
  }
  
  const findDirectConversion = (from, to) => {
    if (!conversionData.value) return null
    return conversionData.value.conversions.find(c => c.from === from && c.to === to)
  }
  
  const findMultiStepConversions = (from, to) => {
    if (!conversionData.value) return []
    
    const routes = []
    
    // Find all programs that 'from' can transfer to
    const fromTransfers = conversionData.value.conversions.filter(c => c.from === from)
    
    // For each intermediate program, check if it can transfer to 'to'
    fromTransfers.forEach(firstStep => {
      const secondStep = conversionData.value.conversions.find(
        c => c.from === firstStep.to && c.to === to
      )
      
      if (secondStep) {
        routes.push({
          steps: [firstStep, secondStep],
          totalRate: firstStep.rate * secondStep.rate
        })
      }
    })
    
    return routes
  }
  
  const getReachablePrograms = (fromProgram) => {
    if (!conversionData.value || !fromProgram) return new Set()
    
    const reachablePrograms = new Set()
    
    // Direct conversions
    conversionData.value.conversions
      .filter(c => c.from === fromProgram)
      .forEach(c => reachablePrograms.add(c.to))
    
    // Two-step conversions
    conversionData.value.conversions
      .filter(c => c.from === fromProgram)
      .forEach(firstStep => {
        conversionData.value.conversions
          .filter(c => c.from === firstStep.to)
          .forEach(secondStep => reachablePrograms.add(secondStep.to))
      })
    
    return reachablePrograms
  }
  
  const getSourcePrograms = (toProgram) => {
    if (!conversionData.value || !toProgram) return new Set()
    
    const sourcePrograms = new Set()
    
    // Direct conversions TO the selected program
    conversionData.value.conversions
      .filter(c => c.to === toProgram)
      .forEach(c => sourcePrograms.add(c.from))
    
    // Two-step conversions TO the selected program
    conversionData.value.conversions
      .filter(c => c.to === toProgram)
      .forEach(lastStep => {
        conversionData.value.conversions
          .filter(c => c.to === lastStep.from)
          .forEach(firstStep => sourcePrograms.add(firstStep.from))
      })
    
    return sourcePrograms
  }
  
  const getTransfersFrom = (fromProgram) => {
    if (!conversionData.value || !fromProgram) return { direct: [], twoStep: [] }
    
    // Direct transfers
    const direct = conversionData.value.conversions.filter(c => c.from === fromProgram)
    
    // Two-step transfers
    const twoStep = []
    conversionData.value.conversions
      .filter(c => c.from === fromProgram)
      .forEach(firstStep => {
        conversionData.value.conversions
          .filter(c => c.from === firstStep.to)
          .forEach(secondStep => {
            twoStep.push({
              to: secondStep.to,
              steps: [firstStep, secondStep],
              totalRate: firstStep.rate * secondStep.rate
            })
          })
      })
    
    return { direct, twoStep }
  }
  
  const getTransfersTo = (toProgram) => {
    if (!conversionData.value || !toProgram) return { direct: [], twoStep: [] }
    
    // Direct transfers
    const direct = conversionData.value.conversions.filter(c => c.to === toProgram)
    
    // Two-step transfers
    const twoStep = []
    conversionData.value.conversions
      .filter(c => c.to === toProgram)
      .forEach(lastStep => {
        conversionData.value.conversions
          .filter(c => c.to === lastStep.from)
          .forEach(firstStep => {
            twoStep.push({
              from: firstStep.from,
              steps: [firstStep, lastStep],
              totalRate: firstStep.rate * lastStep.rate
            })
          })
      })
    
    return { direct, twoStep }
  }
  
  return {
    conversionData,
    loadConversionData,
    findDirectConversion,
    findMultiStepConversions,
    getReachablePrograms,
    getSourcePrograms,
    getTransfersFrom,
    getTransfersTo
  }
}