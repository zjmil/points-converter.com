import React, { useState, useEffect, useMemo } from 'react'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import DollarValueToggle from './components/DollarValueToggle'
import AdvancedSettings from './components/AdvancedSettings'
import ConversionForm from './components/ConversionForm'
import TransferPreview from './components/TransferPreview'
import ConversionResults from './components/ConversionResults'
import AdPlaceholder from './components/AdPlaceholder'
import AffiliateLinks from './components/AffiliateLinks'
import { ConversionProvider, useConversions } from './contexts/ConversionContext'
import { useURLHistory } from './hooks/useURLHistory'

function AppContent() {
  // Reactive state
  const [fromProgram, setFromProgram] = useState('')
  const [toProgram, setToProgram] = useState('')
  const [amount, setAmount] = useState(1000)
  const [showDollarValues, setShowDollarValues] = useState(false)
  const [customDollarValues, setCustomDollarValues] = useState({})
  const [multiStepEnabled, setMultiStepEnabled] = useState(false)

  // Use conversion context
  const { conversionData, loadConversionData, findDirectConversion, findMultiStepConversions } = useConversions()

  // URL history management
  const { initializeFromURL, pushURLHistory, isPopstateChange } = useURLHistory(
    fromProgram, 
    toProgram, 
    amount, 
    setFromProgram, 
    setToProgram, 
    setAmount
  )

  // Computed properties
  const showPreview = useMemo(() => {
    return (fromProgram && !toProgram) || (!fromProgram && toProgram)
  }, [fromProgram, toProgram])

  const conversionResults = useMemo(() => {
    // Only calculate if we have all required data and inputs
    if (!amount || !fromProgram || !toProgram || !conversionData) {
      return null
    }
    
    // Don't show results for same program
    if (fromProgram === toProgram) {
      return null
    }
    
    const directConversion = findDirectConversion(fromProgram, toProgram)
    let multiStepRoutes = findMultiStepConversions(fromProgram, toProgram)
    if (!multiStepEnabled) {
      multiStepRoutes = []
    }
    
    return {
      amount: amount,
      fromProgram: fromProgram,
      toProgram: toProgram,
      directConversion,
      multiStepRoutes,
      programs: conversionData.programs
    }
  }, [amount, fromProgram, toProgram, conversionData, multiStepEnabled, findDirectConversion, findMultiStepConversions])

  const showResults = useMemo(() => {
    return conversionResults !== null
  }, [conversionResults])

  // Methods
  const handleTransferSelection = ({ fromProgram: newFromProgram, toProgram: newToProgram, isUserAction = true }) => {
    if (newFromProgram) {
      setFromProgram(newFromProgram)
    }
    if (newToProgram) {
      setToProgram(newToProgram)
    }
    // For user actions (like clicking transfers), mark for URL history update
    if (isUserAction && !isPopstateChange()) {
      setPendingURLUpdate(true)
    }
  }

  // Track when changes are user-initiated (not from popstate)
  const [pendingURLUpdate, setPendingURLUpdate] = useState(false)

  // Handle user-initiated program changes (from dropdowns, etc.)
  const handleFromProgramChange = (programId) => {
    setFromProgram(programId)
    // Mark that we need to push URL history after state updates
    if (!isPopstateChange()) {
      setPendingURLUpdate(true)
    }
  }

  const handleToProgramChange = (programId) => {
    setToProgram(programId)
    // Mark that we need to push URL history after state updates
    if (!isPopstateChange()) {
      setPendingURLUpdate(true)
    }
  }

  // Handle user-initiated amount changes
  const handleAmountChange = (newAmount) => {
    setAmount(newAmount)
    // Mark that we need to push URL history after state updates
    if (!isPopstateChange()) {
      setPendingURLUpdate(true)
    }
  }

  // Effects
  useEffect(() => {
    // Skip URL initialization in test environment
    if (typeof window === 'undefined' || window.location.href.includes('localhost:3000')) {
      loadConversionData()
      return
    }
    
    initializeFromURL()
    loadConversionData()
  }, [initializeFromURL, loadConversionData])

  // Push URL history when user-initiated changes complete
  useEffect(() => {
    if (pendingURLUpdate) {
      pushURLHistory()
      setPendingURLUpdate(false)
    }
  }, [fromProgram, toProgram, amount, pendingURLUpdate, pushURLHistory])

  return (
    <div className="app">
      <AppHeader />
      
      <main>
        <div className="container">
          <DollarValueToggle 
            value={showDollarValues} 
            onChange={setShowDollarValues} 
          />
          
          {conversionData?.programs && (
            <AdvancedSettings 
              programs={conversionData.programs}
              customDollarValues={customDollarValues}
              onCustomDollarValuesChange={setCustomDollarValues}
              multiStepEnabled={multiStepEnabled}
              onMultiStepEnabledChange={setMultiStepEnabled}
            />
          )}
          
          <ConversionForm
            fromProgram={fromProgram}
            onFromProgramChange={handleFromProgramChange}
            toProgram={toProgram}
            onToProgramChange={handleToProgramChange}
            amount={amount}
            onAmountChange={handleAmountChange}
            programs={conversionData?.programs}
            conversions={conversionData?.conversions}
            showDollarValues={showDollarValues}
            customDollarValues={customDollarValues}
          />
          
          {showPreview && (
            <TransferPreview
              fromProgram={fromProgram}
              toProgram={toProgram}
              programs={conversionData?.programs}
              conversions={conversionData?.conversions}
              onSelectTransfer={handleTransferSelection}
            />
          )}
          
          {showResults && (
            <ConversionResults
              results={conversionResults}
              showDollarValues={showDollarValues}
              customDollarValues={customDollarValues}
              multiStepEnabled={multiStepEnabled}
            />
          )}
          
          {conversionData?.config?.showAdvertisements && (
            <AdPlaceholder />
          )}
          
          {conversionData?.config?.showAffiliateLinks && (
            <AffiliateLinks
              links={conversionData?.affiliateLinks}
            />
          )}
        </div>
      </main>
      
      <AppFooter />
    </div>
  )
}

function App() {
  return (
    <ConversionProvider>
      <AppContent />
    </ConversionProvider>
  )
}

export default App