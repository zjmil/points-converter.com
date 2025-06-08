import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConversionForm from '../components/ConversionForm.vue'
import { mockConversionData } from './fixtures'

// Mock the composable
vi.mock('../composables/useConversions', () => ({
  useConversions: () => ({
    conversionData: { value: mockConversionData },
    getReachablePrograms: vi.fn((from) => {
      if (from === 'chase_ur') {
        return new Set(['hyatt', 'united'])
      }
      return new Set()
    }),
    getSourcePrograms: vi.fn((to) => {
      if (to === 'united') {
        return new Set(['chase_ur', 'marriott'])
      }
      return new Set()
    })
  })
}))

describe('ConversionForm', () => {
  const defaultProps = {
    fromProgram: '',
    toProgram: '',
    amount: 1000,
    programs: mockConversionData.programs,
    conversions: mockConversionData.conversions
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form elements correctly', () => {
    const wrapper = mount(ConversionForm, {
      props: defaultProps
    })

    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('#fromProgram').exists()).toBe(true)
    expect(wrapper.find('#toProgram').exists()).toBe(true)
  })

  it('displays amount input with correct value', () => {
    const wrapper = mount(ConversionForm, {
      props: defaultProps
    })

    const amountInput = wrapper.find('input[type="number"]')
    expect(amountInput.element.value).toBe('1000')
  })

  it('shows grouped program options', () => {
    const wrapper = mount(ConversionForm, {
      props: defaultProps
    })

    const fromSelect = wrapper.find('#fromProgram')
    
    // Check for optgroups
    expect(fromSelect.find('optgroup[label="Bank Points"]').exists()).toBe(true)
    expect(fromSelect.find('optgroup[label="Hotel Programs"]').exists()).toBe(true)
    expect(fromSelect.find('optgroup[label="Airline Programs"]').exists()).toBe(true)
    
    // Check for specific options
    expect(fromSelect.find('option[value="chase_ur"]').text()).toBe('Chase Ultimate Rewards')
    expect(fromSelect.find('option[value="hyatt"]').text()).toBe('World of Hyatt')
  })

  it('emits update events when values change', async () => {
    const wrapper = mount(ConversionForm, {
      props: defaultProps
    })

    // Test amount change
    const amountInput = wrapper.find('input[type="number"]')
    await amountInput.setValue('2000')
    
    expect(wrapper.emitted('update:amount')).toHaveLength(1)
    expect(wrapper.emitted('update:amount')[0]).toEqual([2000])

    // Test from program change
    const fromSelect = wrapper.find('#fromProgram')
    await fromSelect.setValue('chase_ur')
    
    expect(wrapper.emitted('update:fromProgram')).toHaveLength(1)
    expect(wrapper.emitted('update:fromProgram')[0]).toEqual(['chase_ur'])

    // Test to program change
    const toSelect = wrapper.find('#toProgram')
    await toSelect.setValue('hyatt')
    
    expect(wrapper.emitted('update:toProgram')).toHaveLength(1)
    expect(wrapper.emitted('update:toProgram')[0]).toEqual(['hyatt'])
  })





  it('shows filtered options when fromProgram is selected', () => {
    const wrapper = mount(ConversionForm, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    const toSelect = wrapper.find('#toProgram')
    const placeholder = toSelect.find('option[value=""]')
    
    expect(placeholder.text()).toContain('Select from 2 transfer partner')
  })

  it('shows filtered options when toProgram is selected', () => {
    const wrapper = mount(ConversionForm, {
      props: {
        ...defaultProps,
        fromProgram: '',
        toProgram: 'united'
      }
    })

    const fromSelect = wrapper.find('#fromProgram')
    const placeholder = fromSelect.find('option[value=""]')
    
    expect(placeholder.text()).toContain('Select from 2 program')
    expect(placeholder.text()).toContain('that can transfer here')
  })

  it('shows no options message when no transfers are available', () => {
    const wrapper = mount(ConversionForm, {
      props: {
        ...defaultProps,
        fromProgram: 'amex_mr', // Has no transfers to most programs in test data
        toProgram: ''
      }
    })

    const toSelect = wrapper.find('#toProgram')
    const placeholder = toSelect.find('option[value=""]')
    
    expect(placeholder.text()).toBe('No transfer partners available')
  })

  it('sorts program options alphabetically within groups', () => {
    const wrapper = mount(ConversionForm, {
      props: defaultProps
    })

    const bankOptions = wrapper.find('#fromProgram optgroup[label="Bank Points"]')
      .findAll('option')
      .map(option => option.text())

    // Should be sorted: Amex before Chase
    expect(bankOptions[0]).toBe('Amex Membership Rewards')
    expect(bankOptions[1]).toBe('Chase Ultimate Rewards')
  })
})