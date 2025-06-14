import { createContext, useContext, useState, useCallback } from 'react'

const ConversionContext = createContext(null)

export function ConversionProvider({ children }) {
  const [conversionData, setConversionData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadConversionData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try API first, fallback to static JSON if API is not available
      let response
      try {
        // Try production API first, then localhost for development
        const apiUrls = [
          'https://points-converter-api.fly.dev/api/v1/conversions',
          'http://localhost:8080/api/v1/conversions'
        ]
        
        let apiError
        for (const url of apiUrls) {
          try {
            response = await fetch(url)
            if (response.ok) {
              break
            }
          } catch (err) {
            apiError = err
          }
        }
        
        if (!response || !response.ok) {
          throw new Error('API not available')
        }
      } catch (apiError) {
        console.warn('API not available, falling back to static JSON:', apiError)
        response = await fetch('/data/conversions.json')
        if (!response.ok) {
          throw new Error('Failed to fetch conversion data')
        }
      }
      
      const data = await response.json()
      setConversionData(data)
    } catch (error) {
      console.error('Error loading conversion data:', error)
      setError(error.message)
      alert('Error loading conversion data. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const findDirectConversion = useCallback((from, to) => {
    if (!conversionData) return null
    return conversionData.conversions.find(c => c.from === from && c.to === to) || null
  }, [conversionData])

  const findMultiStepConversions = useCallback((from, to) => {
    if (!conversionData) return []
    
    const routes = []
    
    // Find all programs that 'from' can transfer to
    const fromTransfers = conversionData.conversions.filter(c => c.from === from)
    
    // For each intermediate program, check if it can transfer to 'to'
    fromTransfers.forEach(firstStep => {
      const secondStep = conversionData.conversions.find(
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
  }, [conversionData])

  const getReachablePrograms = useCallback((fromProgram) => {
    if (!conversionData || !fromProgram) return new Set()
    
    const reachablePrograms = new Set()
    
    // Direct conversions
    conversionData.conversions
      .filter(c => c.from === fromProgram)
      .forEach(c => reachablePrograms.add(c.to))
    
    // Two-step conversions
    conversionData.conversions
      .filter(c => c.from === fromProgram)
      .forEach(firstStep => {
        conversionData.conversions
          .filter(c => c.from === firstStep.to)
          .forEach(secondStep => reachablePrograms.add(secondStep.to))
      })
    
    return reachablePrograms
  }, [conversionData])

  const getSourcePrograms = useCallback((toProgram) => {
    if (!conversionData || !toProgram) return new Set()
    
    const sourcePrograms = new Set()
    
    // Direct conversions TO the selected program
    conversionData.conversions
      .filter(c => c.to === toProgram)
      .forEach(c => sourcePrograms.add(c.from))
    
    // Two-step conversions TO the selected program
    conversionData.conversions
      .filter(c => c.to === toProgram)
      .forEach(lastStep => {
        conversionData.conversions
          .filter(c => c.to === lastStep.from)
          .forEach(firstStep => sourcePrograms.add(firstStep.from))
      })
    
    return sourcePrograms
  }, [conversionData])

  const getTransfersFrom = useCallback((fromProgram) => {
    if (!conversionData || !fromProgram) return { direct: [], twoStep: [] }
    
    // Direct transfers
    const direct = conversionData.conversions.filter(c => c.from === fromProgram)
    
    // Two-step transfers
    const twoStep = []
    conversionData.conversions
      .filter(c => c.from === fromProgram)
      .forEach(firstStep => {
        conversionData.conversions
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
  }, [conversionData])

  const getTransfersTo = useCallback((toProgram) => {
    if (!conversionData || !toProgram) return { direct: [], twoStep: [] }
    
    // Direct transfers
    const direct = conversionData.conversions.filter(c => c.to === toProgram)
    
    // Two-step transfers
    const twoStep = []
    conversionData.conversions
      .filter(c => c.to === toProgram)
      .forEach(lastStep => {
        conversionData.conversions
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
  }, [conversionData])

  const value = {
    conversionData,
    isLoading,
    error,
    loadConversionData,
    findDirectConversion,
    findMultiStepConversions,
    getReachablePrograms,
    getSourcePrograms,
    getTransfersFrom,
    getTransfersTo
  }

  return (
    <ConversionContext.Provider value={value}>
      {children}
    </ConversionContext.Provider>
  )
}

export function useConversions() {
  const context = useContext(ConversionContext)
  
  if (!context) {
    throw new Error('useConversions must be used within a ConversionProvider')
  }
  
  return context
}