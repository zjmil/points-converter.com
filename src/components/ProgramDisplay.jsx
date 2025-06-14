import { useMemo } from 'react'
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
  
  const getClassName = () => {
    const classes = [styles.programDisplay]
    if (variant !== 'default') {
      classes.push(styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`])
    }
    if (program?.type) {
      classes.push(styles[`type${program.type.charAt(0).toUpperCase() + program.type.slice(1)}`])
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
      <span className={styles.text}>
        {displayText}
      </span>
    </span>
  )
}

export default ProgramDisplay