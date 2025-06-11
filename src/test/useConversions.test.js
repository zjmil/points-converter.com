import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConversions } from '../hooks/useConversions'
import { mockConversionData } from './fixtures'

// Mock fetch globally
global.fetch = vi.fn()

describe('useConversions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset global state
    global.globalConversionData = null
  })

  describe('loadConversionData', () => {
    it('should load conversion data successfully', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { result } = renderHook(() => useConversions())
      
      await act(async () => {
        await result.current.loadConversionData()
      })
      
      expect(result.current.conversionData).toEqual(mockConversionData)
      expect(fetch).toHaveBeenCalledWith('/data/conversions.json')
    })

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useConversions())
      
      await act(async () => {
        await result.current.loadConversionData()
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('Error loading conversion data:', expect.any(Error))
      expect(alertSpy).toHaveBeenCalledWith('Error loading conversion data. Please refresh the page.')
      
      consoleSpy.mockRestore()
      alertSpy.mockRestore()
    })
  })

  describe('findDirectConversion', () => {
    it('should find direct conversion when it exists', () => {
      const { result } = renderHook(() => useConversions())
      
      act(() => {
        result.current.conversionData = mockConversionData
      })
      
      const conversion = result.current.findDirectConversion('chase_ur', 'hyatt')
      expect(conversion).toEqual(mockConversionData.conversions[0])
    })

    it('should return null when no direct conversion exists', () => {
      const { result } = renderHook(() => useConversions())
      
      act(() => {
        result.current.conversionData = mockConversionData
      })
      
      const conversion = result.current.findDirectConversion('hyatt', 'chase_ur')
      expect(conversion).toBeNull()
    })
  })

  describe('findMultiStepConversions', () => {
    it('should find multi-step conversions', () => {
      const { result } = renderHook(() => useConversions())
      
      act(() => {
        result.current.conversionData = mockConversionData
      })
      
      const routes = result.current.findMultiStepConversions('chase_ur', 'marriott')
      expect(routes).toHaveLength(0) // No multi-step route in mock data
      
      // Test a route that should exist: amex -> marriott -> united
      const multiStepRoutes = result.current.findMultiStepConversions('amex_mr', 'united')
      expect(multiStepRoutes).toHaveLength(1)
      expect(multiStepRoutes[0].totalRate).toBe(0.33) // 1.0 * 0.33
    })
  })
})