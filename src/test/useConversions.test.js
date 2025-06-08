import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConversions } from '../composables/useConversions'
import { mockConversionData } from './fixtures'

// Mock fetch globally
global.fetch = vi.fn()

describe('useConversions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadConversionData', () => {
    it('should load conversion data successfully', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { conversionData, loadConversionData } = useConversions()
      
      await loadConversionData()
      
      expect(conversionData.value).toEqual(mockConversionData)
      expect(fetch).toHaveBeenCalledWith('/data/conversions.json')
    })

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const { loadConversionData } = useConversions()
      
      await loadConversionData()
      
      expect(consoleSpy).toHaveBeenCalledWith('Error loading conversion data:', expect.any(Error))
      expect(alertSpy).toHaveBeenCalledWith('Error loading conversion data. Please refresh the page.')
      
      consoleSpy.mockRestore()
      alertSpy.mockRestore()
    })
  })

  describe('findDirectConversion', () => {
    it('should find direct conversion when data is loaded', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { conversionData, loadConversionData, findDirectConversion } = useConversions()
      
      await loadConversionData()
      
      const result = findDirectConversion('chase_ur', 'hyatt')
      
      expect(result).toEqual({
        "from": "chase_ur",
        "to": "hyatt",
        "rate": 1.0,
        "bonus": false,
        "bonusRate": null,
        "instantTransfer": true
      })
    })

    it('should return null when no direct conversion exists', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { loadConversionData, findDirectConversion } = useConversions()
      
      await loadConversionData()
      
      const result = findDirectConversion('chase_ur', 'marriott')
      
      expect(result).toBeNull()
    })

    it('should return null when data is not loaded', () => {
      const { findDirectConversion } = useConversions()
      
      const result = findDirectConversion('chase_ur', 'hyatt')
      
      expect(result).toBeNull()
    })
  })

  describe('findMultiStepConversions', () => {
    it('should find two-step conversion routes', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { loadConversionData, findMultiStepConversions } = useConversions()
      
      await loadConversionData()
      
      const result = findMultiStepConversions('chase_ur', 'united')
      
      expect(result).toHaveLength(1)
      expect(result[0].steps).toHaveLength(2)
      expect(result[0].steps[0].from).toBe('chase_ur')
      expect(result[0].steps[1].to).toBe('united')
      expect(result[0].totalRate).toBeCloseTo(0.33) // 1.0 * 0.33
    })

    it('should return empty array when no multi-step routes exist', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { loadConversionData, findMultiStepConversions } = useConversions()
      
      await loadConversionData()
      
      const result = findMultiStepConversions('amex_mr', 'hyatt')
      
      expect(result).toEqual([])
    })

    it('should return empty array when data is not loaded', () => {
      const { findMultiStepConversions } = useConversions()
      
      const result = findMultiStepConversions('chase_ur', 'united')
      
      expect(result).toEqual([])
    })
  })

  describe('getReachablePrograms', () => {
    it('should return programs reachable from a source program', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { loadConversionData, getReachablePrograms } = useConversions()
      
      await loadConversionData()
      
      const result = getReachablePrograms('chase_ur')
      
      expect(result).toBeInstanceOf(Set)
      expect(result.has('hyatt')).toBe(true) // Direct
      expect(result.has('united')).toBe(true) // Direct + via marriott
      expect(result.has('marriott')).toBe(false) // Not directly reachable
    })

    it('should return empty set when no data or invalid program', () => {
      const { getReachablePrograms } = useConversions()
      
      const result = getReachablePrograms('invalid_program')
      
      expect(result).toBeInstanceOf(Set)
      expect(result.size).toBe(0)
    })
  })

  describe('getSourcePrograms', () => {
    it('should return programs that can reach a target program', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { loadConversionData, getSourcePrograms } = useConversions()
      
      await loadConversionData()
      
      const result = getSourcePrograms('united')
      
      expect(result).toBeInstanceOf(Set)
      expect(result.has('chase_ur')).toBe(true) // Direct
      expect(result.has('marriott')).toBe(true) // Direct
      expect(result.has('amex_mr')).toBe(false) // Not reachable
    })

    it('should return empty set when no data or invalid program', () => {
      const { getSourcePrograms } = useConversions()
      
      const result = getSourcePrograms('invalid_program')
      
      expect(result).toBeInstanceOf(Set)
      expect(result.size).toBe(0)
    })
  })

  describe('getTransfersFrom', () => {
    it('should return direct and two-step transfers from a program', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { loadConversionData, getTransfersFrom } = useConversions()
      
      await loadConversionData()
      
      const result = getTransfersFrom('chase_ur')
      
      expect(result).toHaveProperty('direct')
      expect(result).toHaveProperty('twoStep')
      expect(result.direct).toHaveLength(2) // hyatt and united
      expect(result.twoStep).toHaveLength(0) // No two-step from chase_ur in test data
    })

    it('should return empty arrays when no data', () => {
      const { getTransfersFrom } = useConversions()
      
      const result = getTransfersFrom('chase_ur')
      
      expect(result).toEqual({ direct: [], twoStep: [] })
    })
  })

  describe('getTransfersTo', () => {
    it('should return direct and two-step transfers to a program', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockConversionData)
      })

      const { loadConversionData, getTransfersTo } = useConversions()
      
      await loadConversionData()
      
      const result = getTransfersTo('united')
      
      expect(result).toHaveProperty('direct')
      expect(result).toHaveProperty('twoStep')
      expect(result.direct).toHaveLength(2) // chase_ur and marriott
      expect(result.twoStep).toHaveLength(0) // No two-step to united in test data
    })

    it('should return empty arrays when no data', () => {
      const { getTransfersTo } = useConversions()
      
      const result = getTransfersTo('united')
      
      expect(result).toEqual({ direct: [], twoStep: [] })
    })
  })
})