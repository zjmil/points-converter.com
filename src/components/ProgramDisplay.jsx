import React, { useMemo } from 'react'
import ProgramIcon from './ProgramIcon'

const ProgramDisplay = ({
  programId,
  program,
  showShortName = false,
  iconSize = 'small',
  variant = 'default' // default, compact, full
}) => {
  const displayText = useMemo(() => {
    if (!program) return programId || ''
    
    if (variant === 'compact' && program.shortName) {
      return program.shortName
    }
    
    if (showShortName && program.shortName) {
      return `${program.name} (${program.shortName})`
    }
    
    return program.name
  }, [program, variant, showShortName, programId])
  
  const displayClasses = useMemo(() => {
    const classes = [`variant-${variant}`]
    if (program?.type) {
      classes.push(`type-${program.type}`)
    }
    return classes
  }, [variant, program])
  
  const getStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    }
    
    let textStyles = {
      fontWeight: '500'
    }
    
    // Variant-specific text styles
    if (variant === 'compact') {
      textStyles = {
        ...textStyles,
        fontSize: '0.9rem',
        fontWeight: '600'
      }
    } else if (variant === 'full') {
      textStyles = {
        ...textStyles,
        fontSize: '1.1rem'
      }
    }
    
    // Type-specific text colors to match icons
    if (program?.type === 'bank') {
      textStyles.color = '#2c5aa0'
    } else if (program?.type === 'hotel') {
      textStyles.color = '#22543d'
    } else if (program?.type === 'airline') {
      textStyles.color = '#1a202c'
    }
    
    return { baseStyles, textStyles }
  }
  
  const { baseStyles, textStyles } = getStyles()
  
  return (
    <span style={baseStyles} className={displayClasses.join(' ')}>
      <ProgramIcon 
        programId={programId}
        type={program?.type}
        size={iconSize}
      />
      <span style={textStyles}>
        {displayText}
      </span>
    </span>
  )
}

export default ProgramDisplay