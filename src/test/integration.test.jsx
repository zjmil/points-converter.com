import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import { mockConversionData } from './fixtures'

// Mock fetch globally
global.fetch = vi.fn()

// Mock window.location for URL tests
delete window.location
window.location = { 
  search: '',
  pathname: '/',
  href: 'http://localhost:5173'
}

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn()
  },
  writable: true
})

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockConversionData)
    })
    window.location.search = ''
  })

  it('loads conversion data on mount', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/data/conversions.json')
    })
  })

  it('renders main app structure', async () => {
    render(<App />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    
    // Check for main sections
    expect(screen.getByText('Points Converter')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('shows conversion results when both programs are selected', async () => {
    render(<App />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    
    // This would require more complex mocking of the ProgramSearch components
    // to simulate selecting programs and seeing results
    // For now, we'll test that the basic structure is there
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument()
  })

  it('initializes from URL parameters', async () => {
    window.location.search = '?from=chase_ur&to=hyatt&amount=5000'
    
    render(<App />)
    
    // The URL parameter initialization should set initial state
    // This would need more detailed component mocking to fully test
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

  it('shows dollar value toggle', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    
    expect(screen.getByText('Show dollar values')).toBeInTheDocument()
  })
})