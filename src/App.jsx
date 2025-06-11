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

  // URL parameters handling
  const initializeFromURL = () => {
    // Skip URL initialization in test environment
    if (typeof window === 'undefined' || window.location.href.includes('localhost:3000')) {
      return
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    
    if (urlParams.has('from')) {
      setFromProgram(urlParams.get('from'))
    }
    if (urlParams.has('to')) {
      setToProgram(urlParams.get('to'))
    }
    if (urlParams.has('amount')) {
      const urlAmount = parseInt(urlParams.get('amount'))
      if (!isNaN(urlAmount) && urlAmount > 0) {
        setAmount(urlAmount)
      }
    }
  }

  // Update URL when values change
  const updateURL = () => {
    // Skip URL updates in test environment
    if (typeof window === 'undefined' || window.location.href.includes('localhost:3000')) {
      return
    }
    
    const params = new URLSearchParams()
    
    if (fromProgram) {
      params.set('from', fromProgram)
    }
    if (toProgram) {
      params.set('to', toProgram)
    }
    if (amount !== 1000) {
      params.set('amount', amount.toString())
    }
    
    const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newURL)
  }

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
  const handleTransferSelection = ({ fromProgram: newFromProgram, toProgram: newToProgram }) => {
    if (newFromProgram) {
      setFromProgram(newFromProgram)
    }
    if (newToProgram) {
      setToProgram(newToProgram)
    }
  }

  // Effects
  useEffect(() => {
    initializeFromURL()
    loadConversionData()
  }, [])

  useEffect(() => {
    updateURL()
  }, [fromProgram, toProgram, amount])

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
            onFromProgramChange={setFromProgram}
            toProgram={toProgram}
            onToProgramChange={setToProgram}
            amount={amount}
            onAmountChange={setAmount}
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