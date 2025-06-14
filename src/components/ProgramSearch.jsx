import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useConversions } from '../contexts/ConversionContext'
import { useId } from '../hooks/useId'
import ProgramDisplay from './ProgramDisplay'
import styles from './ProgramSearch.module.css'

const ProgramSearch = ({
  value,
  onChange,
  label,
  placeholder = 'Search or click to browse programs...',
  programs,
  otherProgram, // For filtering based on the other selected program
  isFromProgram // Whether this is the "from" program selector
}) => {
  const { getReachablePrograms, getSourcePrograms, conversionData } = useConversions()
  
  // Refs
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  // Generate unique ID for input
  const inputId = useId('program-search')
  
  // Get all programs
  const allPrograms = useMemo(() => {
    const programsData = conversionData?.programs || programs
    if (!programsData) return []
    
    return Object.entries(programsData).map(([id, program]) => ({
      id,
      name: program.name,
      shortName: program.shortName,
      type: program.type,
      dollarValue: program.dollarValue
    }))
  }, [conversionData, programs])
  
  // Filter programs based on other selection
  const availablePrograms = useMemo(() => {
    if (!otherProgram) {
      return allPrograms
    }
    
    let availableIds
    if (isFromProgram) {
      // This is the "from" selector, filter by what can reach the "to" program
      availableIds = getSourcePrograms(otherProgram)
    } else {
      // This is the "to" selector, filter by what the "from" program can reach
      availableIds = getReachablePrograms(otherProgram)
    }
    
    return allPrograms.filter(program => availableIds.has(program.id))
  }, [allPrograms, otherProgram, isFromProgram, getSourcePrograms, getReachablePrograms])
  
  // Filter programs based on search query
  const filteredPrograms = useMemo(() => {
    if (!searchQuery) {
      return availablePrograms
    }
    
    const query = searchQuery.toLowerCase()
    return availablePrograms.filter(program => 
      program.name.toLowerCase().includes(query) ||
      program.type.toLowerCase().includes(query) ||
      program.id.toLowerCase().includes(query)
    )
  }, [searchQuery, availablePrograms])
  
  // Group filtered programs by type
  const groupedFilteredPrograms = useMemo(() => {
    const groups = { bank: [], hotel: [], airline: [] }
    
    filteredPrograms.forEach(program => {
      if (groups[program.type]) {
        groups[program.type].push(program)
      }
    })
    
    // Sort each group alphabetically
    Object.keys(groups).forEach(type => {
      groups[type].sort((a, b) => a.name.localeCompare(b.name))
    })
    
    return groups
  }, [filteredPrograms])
  
  // Display value in input
  const displayValue = useMemo(() => {
    if (!value) return searchQuery
    
    const selectedProgram = allPrograms.find(p => p.id === value)
    return selectedProgram ? selectedProgram.name : searchQuery
  }, [value, allPrograms, searchQuery])
  
  // Show clear button when program is selected
  const showClearButton = useMemo(() => {
    return !!value
  }, [value])
  
  // Hint text
  const availableHint = useMemo(() => {
    if (!otherProgram) {
      return `${availablePrograms.length} programs available`
    }
    
    const count = availablePrograms.length
    if (count === 0) {
      return 'No programs can transfer with the selected program'
    }
    
    return `${count} program${count === 1 ? '' : 's'} available for transfer`
  }, [otherProgram, availablePrograms.length])
  
  // Get display name for group
  const getGroupDisplayName = (groupName) => {
    const names = {
      bank: 'Bank Points',
      hotel: 'Hotel Programs', 
      airline: 'Airline Programs'
    }
    return names[groupName] || groupName
  }
  
  // Get option index for highlighting
  const getOptionIndex = (programId) => {
    return filteredPrograms.findIndex(p => p.id === programId)
  }
  
  // Methods
  const handleInput = (event) => {
    setSearchQuery(event.target.value)
    setShowDropdown(true)
    setHighlightedIndex(-1)
    
    // Clear selection if user is typing
    if (value) {
      onChange('')
    }
  }
  
  const handleFocus = () => {
    setShowDropdown(true)
    if (!value) {
      setSearchQuery('')
    }
    // Reset highlighted index when opening dropdown
    setHighlightedIndex(-1)
  }
  
  const handleBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false)
      
      // Reset search if no selection
      if (!value) {
        setSearchQuery('')
      }
    }, 300)
  }
  
  const handleKeydown = (event) => {
    if (!showDropdown) return
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex(Math.min(highlightedIndex + 1, filteredPrograms.length - 1))
        break
        
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex(Math.max(highlightedIndex - 1, -1))
        break
        
      case 'Enter':
        event.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredPrograms.length) {
          selectProgram(filteredPrograms[highlightedIndex])
        }
        break
        
      case 'Escape':
        setShowDropdown(false)
        searchInputRef.current?.blur()
        break
    }
  }
  
  const selectProgram = (program) => {
    onChange(program.id)
    setSearchQuery('')
    setShowDropdown(false)
    searchInputRef.current?.blur()
  }
  
  const clearSelection = () => {
    onChange('')
    setSearchQuery('')
    searchInputRef.current?.focus()
  }
  
  const handleDropdownArrowClick = () => {
    if (!showDropdown) {
      searchInputRef.current?.focus()
    }
  }
  
  const scrollToHighlighted = () => {
    if (highlightedIndex >= 0) {
      const options = dropdownRef.current?.querySelectorAll('.program-option')
      if (options && options[highlightedIndex]) {
        options[highlightedIndex].scrollIntoView({
          block: 'nearest'
        })
      }
    }
  }
  
  // Effects
  
  // Watch for external program changes to reset search
  useEffect(() => {
    if (!value) {
      setSearchQuery('')
    }
  }, [value])
  
  // Reset highlighted index when filtered programs change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredPrograms])
  
  // Scroll to highlighted option when highlighted index changes
  useEffect(() => {
    scrollToHighlighted()
  }, [highlightedIndex])
  
  const handleMouseEnter = (programId) => {
    setHighlightedIndex(getOptionIndex(programId))
  }
  
  const handleMouseDown = (event) => {
    event.preventDefault()
  }
  
  return (
    <div className={styles.programSearch} ref={searchContainerRef}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <div className={styles.searchInputWrapper}>
        <input
          id={inputId}
          ref={searchInputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeydown}
          autoComplete="off"
          className={styles.input}
        />
        {showClearButton ? (
          <div className={styles.clearButton} onClick={clearSelection}>
            ×
          </div>
        ) : (
          <div className={styles.dropdownArrow} onClick={handleDropdownArrowClick}>
            ▼
          </div>
        )}
      </div>
      
      {showDropdown && (
        <div 
          className={styles.dropdown}
          ref={dropdownRef}
          onMouseDown={handleMouseDown}
        >
          <div className={styles.dropdownHeader}>
            {searchQuery && filteredPrograms.length > 0 ? (
              <span>
                {filteredPrograms.length} result{filteredPrograms.length === 1 ? '' : 's'}
              </span>
            ) : !searchQuery ? (
              <span>{availableHint}</span>
            ) : null}
          </div>
          
          <div className={styles.programGroups}>
            {Object.entries(groupedFilteredPrograms).map(([groupName, groupPrograms]) => (
              groupPrograms.length > 0 && (
                <div key={groupName} className={styles.programGroup}>
                  <div className={styles.groupHeader}>{getGroupDisplayName(groupName)}</div>
                  {groupPrograms.map((program) => (
                    <div 
                      key={program.id}
                      className={`${styles.programOption} ${highlightedIndex === getOptionIndex(program.id) ? styles.highlighted : ''}`}
                      onClick={() => selectProgram(program)}
                      onMouseEnter={() => handleMouseEnter(program.id)}
                    >
                      <div className={styles.programMain}>
                        <ProgramDisplay 
                          programId={program.id}
                          program={program}
                          variant="default"
                          iconSize="small"
                        />
                      </div>
                      <div className={styles.programType}>{program.type}</div>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
          
          {filteredPrograms.length === 0 && searchQuery && (
            <div className={styles.noResults}>
              No programs found matching "{searchQuery}"
            </div>
          )}
          
          {!searchQuery && availablePrograms.length === 0 && (
            <div className={styles.noResults}>
              No programs available for transfer
            </div>
          )}
        </div>
      )}
    </div>
  )
}


export default ProgramSearch