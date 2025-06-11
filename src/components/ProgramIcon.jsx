import React, { useMemo } from 'react';

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

  const iconStyle = useMemo(() => {
    const baseStyle = {
      display: 'inline-block',
      marginRight: '0.5rem',
      fontStyle: 'normal',
      lineHeight: 1
    };

    // Size styles
    const sizeStyles = {
      small: { fontSize: '1rem' },
      medium: { fontSize: '1.25rem' },
      large: { fontSize: '1.5rem' }
    };

    // Type-specific styling
    const typeStyles = {
      bank: { filter: 'hue-rotate(210deg)' }, // Blue tint for banks
      hotel: { filter: 'hue-rotate(120deg)' }, // Green tint for hotels
      airline: { filter: 'hue-rotate(0deg)' } // Keep original color for airlines
    };

    // Specific program colors
    const programStyles = {
      'chase_ur': { color: '#003087' }, // Chase blue
      'amex_mr': { color: '#006FCF' }, // Amex blue
      'hyatt': { color: '#943126' }, // Hyatt red
      'marriott': { color: '#B8860B' }, // Marriott gold
      'united': { color: '#0039A6' }, // United blue
      'delta': { color: '#CE0037' }, // Delta red
      'american': { color: '#C41E3A' } // American red
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...typeStyles[type],
      ...programStyles[programId]
    };
  }, [size, type, programId]);

  return (
    <span 
      className={`program-icon icon-${size} icon-${type} ${programId ? `icon-${programId}` : ''}`}
      style={iconStyle}
    >
      {iconSymbol}
    </span>
  );
};

export default ProgramIcon;