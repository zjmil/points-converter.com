// Utility functions for component logic

/**
 * Converts a string like 'chase_ur' to 'ChaseUr' for CSS class names
 */
export const toCamelCase = (str) => {
  return str.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')
}

/**
 * Generates CSS class names for program icons
 */
export const getIconClassName = (styles, size, type, programId) => {
  const classes = [styles.programIcon]
  
  // Add size class
  if (size) {
    classes.push(styles[`icon${size.charAt(0).toUpperCase() + size.slice(1)}`])
  }
  
  // Add type class
  if (type) {
    classes.push(styles[`icon${type.charAt(0).toUpperCase() + type.slice(1)}`])
  }
  
  // Add program-specific class
  if (programId) {
    const programClass = toCamelCase(programId)
    classes.push(styles[`icon${programClass}`])
  }
  
  return classes.filter(Boolean).join(' ')
}

/**
 * Icon mappings for different programs and types
 */
export const ICON_MAPPINGS = {
  // Specific program icons
  programs: {
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
  },
  
  // Fallback icons by type
  types: {
    'bank': '🏦',
    'hotel': '🏨',
    'airline': '✈️'
  },
  
  // Default fallback
  default: '💳'
}