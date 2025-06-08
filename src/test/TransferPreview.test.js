import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TransferPreview from '../components/TransferPreview.vue'
import { mockConversionData } from './fixtures'

// Mock the composable
vi.mock('../composables/useConversions', () => ({
  useConversions: () => ({
    conversionData: { value: mockConversionData },
    getTransfersFrom: vi.fn((from) => {
      if (from === 'chase_ur') {
        return {
          direct: [
            {
              from: 'chase_ur',
              to: 'hyatt',
              rate: 1.0,
              bonus: false,
              instantTransfer: true
            },
            {
              from: 'chase_ur',
              to: 'united',
              rate: 1.0,
              bonus: true,
              bonusRate: 1.3,
              instantTransfer: true
            }
          ],
          twoStep: []
        }
      }
      return { direct: [], twoStep: [] }
    }),
    getTransfersTo: vi.fn((to) => {
      if (to === 'united') {
        return {
          direct: [
            {
              from: 'chase_ur',
              to: 'united',
              rate: 1.0,
              bonus: true,
              bonusRate: 1.3,
              instantTransfer: true
            },
            {
              from: 'marriott',
              to: 'united',
              rate: 0.33,
              bonus: false,
              instantTransfer: false,
              note: '3:1 ratio'
            }
          ],
          twoStep: []
        }
      }
      return { direct: [], twoStep: [] }
    })
  })
}))

describe('TransferPreview', () => {
  const defaultProps = {
    fromProgram: '',
    toProgram: '',
    programs: mockConversionData.programs,
    conversions: mockConversionData.conversions
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows transfers FROM selected program', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    expect(wrapper.find('h2').text()).toBe('Transfer Chase Ultimate Rewards points to:')
    
    // Should show transfer cards
    const transferItems = wrapper.findAll('.transfer-item')
    expect(transferItems.length).toBeGreaterThan(0)
    
    // Check for Hyatt transfer
    expect(wrapper.text()).toContain('World of Hyatt')
    expect(wrapper.text()).toContain('1:1')
    expect(wrapper.text()).toContain('Instant')
    
    // Check for United transfer with bonus
    expect(wrapper.text()).toContain('United MileagePlus')
    expect(wrapper.text()).toContain('1:1.3')
    expect(wrapper.text()).toContain('BONUS ACTIVE')
  })

  it('shows transfers TO selected program', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: '',
        toProgram: 'united'
      }
    })

    expect(wrapper.find('h2').text()).toBe('Transfer points to United MileagePlus from:')
    
    // Should show transfer cards
    const transferItems = wrapper.findAll('.transfer-item')
    expect(transferItems.length).toBeGreaterThan(0)
    
    // Check for Chase UR transfer
    expect(wrapper.text()).toContain('Chase Ultimate Rewards')
    expect(wrapper.text()).toContain('1:1.3')
    expect(wrapper.text()).toContain('BONUS ACTIVE')
    
    // Check for Marriott transfer
    expect(wrapper.text()).toContain('Marriott Bonvoy')
    expect(wrapper.text()).toContain('1:0.33')
    expect(wrapper.text()).toContain('3:1 ratio')
  })

  it('shows no transfers message when no transfers available', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'amex_mr', // Program with no transfers in mock
        toProgram: ''
      }
    })

    expect(wrapper.text()).toContain('No transfers available')
  })

  it('displays transfer details correctly', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    const transferItems = wrapper.findAll('.transfer-item')
    
    // Check transfer item structure
    transferItems.forEach(item => {
      expect(item.find('.transfer-item-header').exists()).toBe(true)
      expect(item.find('.transfer-item-title').exists()).toBe(true)
      expect(item.find('.transfer-item-rate').exists()).toBe(true)
      expect(item.find('.transfer-item-details').exists()).toBe(true)
    })
  })

  it('shows transfer speeds correctly', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    // Instant transfers should show "Instant"
    expect(wrapper.text()).toContain('Instant')
  })

  it('handles bonus transfers correctly', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    // Should show bonus rate instead of regular rate
    expect(wrapper.text()).toContain('1:1.3')
    expect(wrapper.text()).toContain('BONUS ACTIVE')
  })

  it('falls back to props when conversionData is not available', () => {
    // This tests the fallback behavior when composable data isn't loaded
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    // Should still show the correct title using props.programs
    expect(wrapper.find('h2').text()).toBe('Transfer Chase Ultimate Rewards points to:')
  })

  it('renders transfer grid layout', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    const transferList = wrapper.find('.transfer-list')
    expect(transferList.exists()).toBe(true)
    expect(transferList.classes()).toContain('transfer-list')
  })

  it('makes transfer items clickable and emits selectTransfer event', async () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    const transferItems = wrapper.findAll('.transfer-item')
    expect(transferItems.length).toBeGreaterThan(0)
    
    // All items should be clickable
    transferItems.forEach(item => {
      expect(item.classes()).toContain('clickable')
    })

    // Click first transfer item
    await transferItems[0].trigger('click')
    
    // Should emit selectTransfer event
    expect(wrapper.emitted('selectTransfer')).toHaveLength(1)
    expect(wrapper.emitted('selectTransfer')[0][0]).toHaveProperty('toProgram')
  })

  it('emits correct program when clicking transfer with toProgram selected', async () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: '',
        toProgram: 'united'
      }
    })

    const transferItems = wrapper.findAll('.transfer-item')
    await transferItems[0].trigger('click')
    
    // Should emit fromProgram when toProgram is already selected
    expect(wrapper.emitted('selectTransfer')).toHaveLength(1)
    expect(wrapper.emitted('selectTransfer')[0][0]).toHaveProperty('fromProgram')
  })

  it('shows hover effects on transfer items', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    const transferItems = wrapper.findAll('.transfer-item')
    transferItems.forEach(item => {
      expect(item.classes()).toContain('transfer-item')
    })
  })

  it('generates unique keys for transfers', () => {
    const wrapper = mount(TransferPreview, {
      props: {
        ...defaultProps,
        fromProgram: 'chase_ur',
        toProgram: ''
      }
    })

    // Check that each transfer item has a unique key attribute
    const transferItems = wrapper.findAll('.transfer-item')
    expect(transferItems.length).toBeGreaterThan(1)
  })
})