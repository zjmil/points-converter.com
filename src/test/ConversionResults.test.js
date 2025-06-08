import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConversionResults from '../components/ConversionResults.vue'
import { mockConversionData } from './fixtures'

describe('ConversionResults', () => {
  const mockResults = {
    amount: 10000,
    fromProgram: 'amex_mr',
    toProgram: 'united',
    directConversion: null,
    multiStepRoutes: [
      {
        from: 'amex_mr',
        steps: [
          {
            from: 'amex_mr',
            to: 'marriott',
            rate: 1.0,
            bonus: false,
            bonusRate: null,
            instantTransfer: false
          },
          {
            from: 'marriott',
            to: 'united',
            rate: 0.33,
            bonus: false,
            bonusRate: null,
            instantTransfer: false,
            note: '3:1 ratio'
          }
        ],
        totalRate: 0.33
      }
    ],
    programs: mockConversionData.programs
  }

  it('renders multi-step routes as clickable', () => {
    const wrapper = mount(ConversionResults, {
      props: { results: mockResults }
    })

    const routes = wrapper.findAll('.conversion-step')
    expect(routes).toHaveLength(1)
    expect(routes[0].classes()).toContain('clickable')
    expect(routes[0].text()).toContain('Click for details')
  })

  it('expands route details when clicked', async () => {
    const wrapper = mount(ConversionResults, {
      props: { results: mockResults }
    })

    const route = wrapper.find('.conversion-step')
    
    // Initially collapsed
    expect(route.classes()).toContain('clickable')
    expect(route.find('.route-summary').exists()).toBe(true)
    expect(route.find('.route-details').exists()).toBe(false)

    // Click to expand
    await route.trigger('click')

    // Should now be expanded
    expect(route.classes()).toContain('expanded')
    expect(route.find('.route-summary').exists()).toBe(false)
    expect(route.find('.route-details').exists()).toBe(true)
    expect(route.find('.step-details').exists()).toBe(true)
  })

  it('shows detailed step information when expanded', async () => {
    const wrapper = mount(ConversionResults, {
      props: { results: mockResults }
    })

    const route = wrapper.find('.conversion-step')
    await route.trigger('click')

    const stepDetails = wrapper.findAll('.step-info')
    expect(stepDetails).toHaveLength(2)
    
    // Check first step details
    expect(stepDetails[0].text()).toContain('Step 1:')
    expect(stepDetails[0].text()).toContain('Exchange Rate: 1:1')
    expect(stepDetails[0].text()).toContain('May take 1-2 days')

    // Check second step details  
    expect(stepDetails[1].text()).toContain('Step 2:')
    expect(stepDetails[1].text()).toContain('Exchange Rate: 1:0.33')
    expect(stepDetails[1].text()).toContain('Note: 3:1 ratio')
  })

  it('toggles expansion state when clicked multiple times', async () => {
    const wrapper = mount(ConversionResults, {
      props: { results: mockResults }
    })

    const route = wrapper.find('.conversion-step')
    
    // Click to expand
    await route.trigger('click')
    expect(route.classes()).toContain('expanded')
    
    // Click to collapse
    await route.trigger('click')
    expect(route.classes()).toContain('clickable')
    expect(route.classes()).not.toContain('expanded')
  })

  it('shows expand/collapse icons', async () => {
    const wrapper = mount(ConversionResults, {
      props: { results: mockResults }
    })

    const expandIcon = wrapper.find('.expand-icon')
    
    // Initially shows + icon
    expect(expandIcon.text()).toBe('+')
    
    // Click to expand
    await wrapper.find('.conversion-step').trigger('click')
    
    // Should show - icon when expanded
    expect(expandIcon.text()).toBe('−')
  })
})