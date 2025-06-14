import React, { useMemo } from 'react'
import ProgramIcon from './ProgramIcon'
import styles from './ProgramDisplay.module.css'

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
  
  const getClassName = () => {
    const classes = [styles.programDisplay, `variant-${variant}`]
    if (program?.type) {
      classes.push(`type-${program.type}`)
    }
    return classes.join(' ')
  }
  
  return (
    <span className={getClassName()}>
      <ProgramIcon 
        programId={programId}
        type={program?.type}
        size={iconSize}
      />
      <span className={`${styles.text} ${styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${program?.type ? styles[`type${program.type.charAt(0).toUpperCase() + program.type.slice(1)}`] : ''}`}>
        {displayText}
      </span>
    </span>
  )
}

export default ProgramDisplay