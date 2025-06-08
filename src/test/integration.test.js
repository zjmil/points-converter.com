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

  // Helper function to select a program in ProgramSearch component
  const selectProgram = async (wrapper, programId, isFromProgram = true) => {
    const programSearches = wrapper.findAllComponents({ name: 'ProgramSearch' })
    const searchComponent = isFromProgram ? programSearches[0] : programSearches[1]
    await searchComponent.vm.$emit('update:model-value', programId)
    await wrapper.vm.$nextTick()
  }

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
    
    // Select a from program using helper
    await selectProgram(wrapper, 'chase_ur', true)
    
    // Should show transfer preview
    expect(wrapper.find('.transfer-preview').exists()).toBe(true)
    expect(wrapper.text()).toContain('Transfer Chase Ultimate Rewards points to:')
  })

  it('shows transfer preview when selecting to program', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Select a to program using helper
    await selectProgram(wrapper, 'united', false)
    
    // Should show transfer preview
    expect(wrapper.find('.transfer-preview').exists()).toBe(true)
    expect(wrapper.text()).toContain('Transfer points to United MileagePlus from:')
  })

  it('hides transfer preview when both programs are selected', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Select both programs using helper
    await selectProgram(wrapper, 'chase_ur', true)
    await selectProgram(wrapper, 'hyatt', false)
    
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
    await amountInput.setValue('10000')
    
    await selectProgram(wrapper, 'chase_ur', true)
    await selectProgram(wrapper, 'hyatt', false)
    
    // Should show conversion results automatically
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Conversion Results')
    expect(wrapper.text()).toContain('10,000 Chase Ultimate Rewards → 10,000 World of Hyatt')
  })

  it('shows program search components for currency selection', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Check that ProgramSearch components are rendered
    const programSearches = wrapper.findAllComponents({ name: 'ProgramSearch' })
    expect(programSearches).toHaveLength(2)
    
    // Verify the filtering logic is working by selecting a program
    await selectProgram(wrapper, 'chase_ur', true)
    
    // Should show transfer preview indicating filtering is working
    expect(wrapper.find('.transfer-preview').exists()).toBe(true)
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
    await selectProgram(wrapper, 'chase_ur', true)
    
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
    await amountInput.setValue('1000')
    
    await selectProgram(wrapper, 'chase_ur', true)
    await selectProgram(wrapper, 'chase_ur', false)
    
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

  it('allows clicking transfer previews to populate other currency', async () => {
    const wrapper = mount(App)
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Select chase_ur to show transfer preview
    await selectProgram(wrapper, 'chase_ur', true)
    
    // Should show transfer preview
    expect(wrapper.find('.transfer-preview').exists()).toBe(true)
    
    // Click on a transfer item
    const transferItems = wrapper.findAll('.transfer-item')
    expect(transferItems.length).toBeGreaterThan(0)
    
    await transferItems[0].trigger('click')
    await wrapper.vm.$nextTick()
    
    // Should now have both programs selected and show conversion results
    const programSearches = wrapper.findAllComponents({ name: 'ProgramSearch' })
    expect(programSearches[1].props('modelValue')).toBeTruthy()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.find('.transfer-preview').exists()).toBe(false)
  })
})