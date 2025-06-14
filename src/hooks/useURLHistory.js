import { useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for managing URL history with proper browser back/forward support
 */
export const useURLHistory = (fromProgram, toProgram, amount, setFromProgram, setToProgram, setAmount) => {
  const isInitialLoadRef = useRef(true)
  const lastURLRef = useRef('')

  // Initialize from URL on mount
  const initializeFromURL = useCallback(() => {
    // Skip URL operations in test environment
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
      const amountParam = parseInt(urlParams.get('amount'))
      if (!isNaN(amountParam) && amountParam > 0) {
        setAmount(amountParam)
      }
    }
    
    isInitialLoadRef.current = false
  }, [setFromProgram, setToProgram, setAmount])

  // Update URL with proper history management
  const updateURL = useCallback((shouldPushHistory = false) => {
    // Skip URL operations in test environment
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

    const newURL = params.toString() 
      ? `${window.location.pathname}?${params.toString()}` 
      : window.location.pathname

    // Avoid duplicate history entries for the same URL
    if (newURL === lastURLRef.current) {
      return
    }

    lastURLRef.current = newURL

    if (isInitialLoadRef.current) {
      // Initial load or programmatic update - replace current history entry
      window.history.replaceState({ fromProgram, toProgram, amount }, '', newURL)
    } else if (shouldPushHistory) {
      // User action that should create new history entry
      window.history.pushState({ fromProgram, toProgram, amount }, '', newURL)
    } else {
      // Update current history entry
      window.history.replaceState({ fromProgram, toProgram, amount }, '', newURL)
    }
  }, [fromProgram, toProgram, amount])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      // If we have state in the history entry, use it
      if (event.state) {
        const { fromProgram: historyFrom, toProgram: historyTo, amount: historyAmount } = event.state
        
        setFromProgram(historyFrom || '')
        setToProgram(historyTo || '')
        setAmount(historyAmount || 1000)
      } else {
        // No state available, parse from URL
        const urlParams = new URLSearchParams(window.location.search)
        
        setFromProgram(urlParams.get('from') || '')
        setToProgram(urlParams.get('to') || '')
        
        const amountParam = parseInt(urlParams.get('amount'))
        setAmount(!isNaN(amountParam) && amountParam > 0 ? amountParam : 1000)
      }
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [setFromProgram, setToProgram, setAmount])

  // Update URL when state changes
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      updateURL(false) // Don't push history for programmatic updates
    }
  }, [fromProgram, toProgram, amount, updateURL])

  return {
    initializeFromURL,
    updateURLWithHistory: (shouldPush = true) => updateURL(shouldPush),
    pushURLHistory: () => updateURL(true),
    replaceURLHistory: () => updateURL(false)
  }
}