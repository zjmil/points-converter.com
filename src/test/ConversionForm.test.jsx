import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConversionForm from '../components/ConversionForm'
import { mockConversionData } from './fixtures'

// Mock the hooks
vi.mock('../hooks/useConversions', () => ({
  useConversions: () => ({
    conversionData: mockConversionData,
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

vi.mock('../hooks/useDollarValues', () => ({
  useDollarValues: () => ({
    formatDollarValue: vi.fn((amount, value) => `$${Math.round(amount * value)}`),
    getProgramDollarValue: vi.fn((program, programs, custom) => programs[program]?.dollarValue)
  })
}))

// Mock ProgramSearch component
vi.mock('../components/ProgramSearch', () => ({
  default: ({ value, onChange, label, placeholder }) => (
    <div data-testid={`program-search-${label.toLowerCase()}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`${label.toLowerCase()}-input`}
      />
    </div>
  )
}))

describe('ConversionForm', () => {
  const defaultProps = {
    fromProgram: '',
    onFromProgramChange: vi.fn(),
    toProgram: '',
    onToProgramChange: vi.fn(),
    amount: 1000,
    onAmountChange: vi.fn(),
    programs: mockConversionData.programs,
    conversions: mockConversionData.conversions,
    showDollarValues: false,
    customDollarValues: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders amount input with correct value', () => {
    render(<ConversionForm {...defaultProps} />)
    
    const amountInput = screen.getByDisplayValue('1000')
    expect(amountInput).toBeInTheDocument()
    expect(amountInput).toHaveAttribute('type', 'number')
  })

  it('calls onAmountChange when amount input changes', () => {
    render(<ConversionForm {...defaultProps} />)
    
    const amountInput = screen.getByDisplayValue('1000')
    fireEvent.change(amountInput, { target: { value: '2000' } })
    
    expect(defaultProps.onAmountChange).toHaveBeenCalledWith(2000)
  })

  it('renders from and to program search components', () => {
    render(<ConversionForm {...defaultProps} />)
    
    expect(screen.getByTestId('program-search-from')).toBeInTheDocument()
    expect(screen.getByTestId('program-search-to')).toBeInTheDocument()
  })

  it('shows dollar hint when showDollarValues is true and fromProgram is set', () => {
    const props = {
      ...defaultProps,
      fromProgram: 'chase_ur',
      showDollarValues: true
    }
    
    render(<ConversionForm {...props} />)
    
    // Should show dollar value hint
    expect(screen.getByText('$13')).toBeInTheDocument() // 1000 * 0.0125 = 12.5, rounded to 13
  })

  it('does not show dollar hint when showDollarValues is false', () => {
    const props = {
      ...defaultProps,
      fromProgram: 'chase_ur',
      showDollarValues: false
    }
    
    render(<ConversionForm {...props} />)
    
    expect(screen.queryByText('$13')).not.toBeInTheDocument()
  })

  it('renders arrow between from and to sections', () => {
    render(<ConversionForm {...defaultProps} />)
    
    expect(screen.getByText('→')).toBeInTheDocument()
  })
})