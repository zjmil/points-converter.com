import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { mockConversionData } from './fixtures'

// Mock fetch globally
global.fetch = vi.fn()

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful fetch by default
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockConversionData)
    })
  })

  it('loads data on mount and populates components', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    expect(fetch).toHaveBeenCalledWith('/data/conversions.json')
    
    // Check that DataInfo component shows loaded data
    expect(wrapper.text()).toContain('Last updated:')
    expect(wrapper.text()).toContain('Source: Test data')
  })

  it('shows transfer preview when selecting from program', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Select a from program
    const fromSelect = wrapper.find('#fromProgram')
    await fromSelect.setValue('chase_ur')
    await wrapper.vm.$nextTick()
    
    // Should show transfer preview
    expect(wrapper.find('.transfer-preview').exists()).toBe(true)
    expect(wrapper.text()).toContain('Transfer Chase Ultimate Rewards points to:')
  })

  it('shows transfer preview when selecting to program', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Select a to program
    const toSelect = wrapper.find('#toProgram')
    await toSelect.setValue('united')
    await wrapper.vm.$nextTick()
    
    // Should show transfer preview
    expect(wrapper.find('.transfer-preview').exists()).toBe(true)
    expect(wrapper.text()).toContain('Transfer points to United MileagePlus from:')
  })

  it('hides transfer preview when both programs are selected', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Select both programs
    const fromSelect = wrapper.find('#fromProgram')
    const toSelect = wrapper.find('#toProgram')
    
    await fromSelect.setValue('chase_ur')
    await toSelect.setValue('hyatt')
    await wrapper.vm.$nextTick()
    
    // Should hide transfer preview
    const preview = wrapper.find('.transfer-preview')
    expect(preview.exists()).toBe(false)
  })

  it('shows conversion results automatically when both programs are selected', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Fill in the form
    const amountInput = wrapper.find('#fromAmount')
    const fromSelect = wrapper.find('#fromProgram')
    const toSelect = wrapper.find('#toProgram')
    
    await amountInput.setValue('10000')
    await fromSelect.setValue('chase_ur')
    await toSelect.setValue('hyatt')
    await wrapper.vm.$nextTick()
    
    // Should show conversion results automatically
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Conversion Results')
    expect(wrapper.text()).toContain('10,000 Chase Ultimate Rewards → 10,000 World of Hyatt')
  })

  it('filters dropdown options based on available conversions', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Select chase_ur
    const fromSelect = wrapper.find('#fromProgram')
    await fromSelect.setValue('chase_ur')
    await wrapper.vm.$nextTick()
    
    // Check that to dropdown shows filtered options
    const toSelect = wrapper.find('#toProgram')
    const placeholder = toSelect.find('option[value=""]')
    
    expect(placeholder.text()).toContain('transfer partner')
  })

  it('handles data loading errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    // Mock fetch failure
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    const wrapper = mount(App)
    
    // Wait for error handling
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    expect(consoleSpy).toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalledWith('Error loading conversion data. Please refresh the page.')
    
    consoleSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it('does not show results with incomplete inputs', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Only fill partial fields
    const fromSelect = wrapper.find('#fromProgram')
    await fromSelect.setValue('chase_ur')
    await wrapper.vm.$nextTick()
    
    // Should not show conversion results
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('does not show results when same programs are selected', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Fill form with same program
    const amountInput = wrapper.find('#fromAmount')
    const fromSelect = wrapper.find('#fromProgram')
    const toSelect = wrapper.find('#toProgram')
    
    await amountInput.setValue('1000')
    await fromSelect.setValue('chase_ur')
    await toSelect.setValue('chase_ur')
    await wrapper.vm.$nextTick()
    
    // Should not show conversion results
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('loads affiliate links', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Should show affiliate section
    expect(wrapper.text()).toContain('Need More Points?')
    expect(wrapper.text()).toContain('Test Card')
    expect(wrapper.text()).toContain('60,000 points')
  })
})