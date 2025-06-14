import React, { useMemo } from 'react';
import styles from './ProgramIcon.module.css';

const ProgramIcon = ({ programId, type, size = 'small' }) => {
  
  const iconSymbol = useMemo(() => {
    // Specific icons for major programs
    const specificIcons = {
      'chase_ur': '🏦',
      'amex_mr': '🏦', 
      'citi_typ': '🏦',
      'capital_one': '🏦',
      'marriott': '🏨',
      'hilton': '🏨',
      'hyatt': '🏨',
      'ihg': '🏨',
      'united': '✈️',
      'american': '✈️',
      'delta': '✈️',
      'southwest': '✈️',
      'jetblue': '✈️',
      'british_airways': '✈️',
      'singapore': '✈️',
      'virgin_atlantic': '✈️',
      'air_france': '✈️',
      'emirates': '✈️'
    };

    if (specificIcons[programId]) {
      return specificIcons[programId];
    }

    // Fallback based on type
    const typeIcons = {
      'bank': '🏦',
      'hotel': '🏨',
      'airline': '✈️'
    };

    return typeIcons[type] || '💳';
  }, [programId, type]);

  const getClassName = () => {
    const classes = [styles.programIcon, styles[`icon${size.charAt(0).toUpperCase() + size.slice(1)}`]]
    if (type) {
      classes.push(styles[`icon${type.charAt(0).toUpperCase() + type.slice(1)}`])
    }
    if (programId) {
      const programClass = programId.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
      classes.push(styles[`icon${programClass}`])
    }
    return classes.join(' ')
  }

  return (
    <span className={getClassName()}>
      {iconSymbol}
    </span>
  );
};

export default ProgramIcon;