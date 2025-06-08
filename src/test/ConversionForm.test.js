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
    expect(wrapper.findAllComponents({ name: 'ProgramSearch' })).toHaveLength(2)
    expect(wrapper.text()).toContain('From')
    expect(wrapper.text()).toContain('To')
  })

  it('displays amount input with correct value', () => {
    const wrapper = mount(ConversionForm, {
      props: defaultProps
    })

    const amountInput = wrapper.find('input[type="number"]')
    expect(amountInput.element.value).toBe('1000')
  })

  it('shows search inputs with proper labels', () => {
    const wrapper = mount(ConversionForm, {
      props: defaultProps
    })

    const programSearches = wrapper.findAllComponents({ name: 'ProgramSearch' })
    expect(programSearches).toHaveLength(2)
    
    // Check that both search components are rendered
    expect(wrapper.text()).toContain('From')
    expect(wrapper.text()).toContain('To')
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

    // Test program change through ProgramSearch components
    const programSearches = wrapper.findAllComponents({ name: 'ProgramSearch' })
    
    // Emit from first ProgramSearch (from)
    await programSearches[0].vm.$emit('update:model-value', 'chase_ur')
    expect(wrapper.emitted('update:fromProgram')).toBeTruthy()
    expect(wrapper.emitted('update:fromProgram')[0]).toEqual(['chase_ur'])

    // Emit from second ProgramSearch (to)  
    await programSearches[1].vm.$emit('update:model-value', 'hyatt')
    expect(wrapper.emitted('update:toProgram')).toBeTruthy()
    expect(wrapper.emitted('update:toProgram')[0]).toEqual(['hyatt'])
  })




  it('passes correct props to ProgramSearch components', () => {
    const wrapper = mount(ConversionForm, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: 'hyatt'
      }
    })

    const programSearches = wrapper.findAllComponents({ name: 'ProgramSearch' })
    
    // Check from component props
    expect(programSearches[0].props('modelValue')).toBe('chase_ur')
    expect(programSearches[0].props('label')).toBe('From')
    expect(programSearches[0].props('isFromProgram')).toBe(true)
    expect(programSearches[0].props('otherProgram')).toBe('hyatt')
    
    // Check to component props
    expect(programSearches[1].props('modelValue')).toBe('hyatt')
    expect(programSearches[1].props('label')).toBe('To')
    expect(programSearches[1].props('isFromProgram')).toBe(false)
    expect(programSearches[1].props('otherProgram')).toBe('chase_ur')
  })
})