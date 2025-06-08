<template>
  <div class="program-search" ref="searchContainer">
    <label :for="inputId">{{ label }}</label>
    <div class="search-input-wrapper">
      <input
        :id="inputId"
        ref="searchInput"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        autocomplete="off"
      >
      <div v-if="showClearButton" class="clear-button" @click="clearSelection">
        ×
      </div>
      <div v-else class="dropdown-arrow" @click="handleDropdownArrowClick">
        ▼
      </div>
    </div>
    
    <div 
      v-if="showDropdown" 
      class="dropdown"
      ref="dropdown"
      @mousedown.prevent
    >
      <div class="dropdown-header">
        <span v-if="searchQuery && filteredPrograms.length > 0">
          {{ filteredPrograms.length }} result{{ filteredPrograms.length === 1 ? '' : 's' }}
        </span>
        <span v-else-if="!searchQuery">
          {{ availableHint }}
        </span>
      </div>
      
      <div class="program-groups">
        <template 
          v-for="(groupPrograms, groupName) in groupedFilteredPrograms" 
          :key="groupName"
        >
          <div 
            v-if="groupPrograms.length > 0"
            class="program-group"
          >
          <div class="group-header">{{ getGroupDisplayName(groupName) }}</div>
          <div 
            v-for="(program, index) in groupPrograms"
            :key="program.id"
            :class="['program-option', { 'highlighted': highlightedIndex === getOptionIndex(program.id) }]"
            @click="selectProgram(program)"
            @mouseenter="highlightedIndex = getOptionIndex(program.id)"
          >
            <div class="program-main">
              <ProgramDisplay 
                :programId="program.id"
                :program="program"
                variant="default"
                iconSize="small"
              />
            </div>
            <div class="program-type">{{ program.type }}</div>
          </div>
          </div>
        </template>
      </div>
      
      <div v-if="filteredPrograms.length === 0 && searchQuery" class="no-results">
        No programs found matching "{{ searchQuery }}"
      </div>
      
      <div v-if="!searchQuery && availablePrograms.length === 0" class="no-results">
        No programs available for transfer
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useConversions } from '../composables/useConversions'
import ProgramDisplay from './ProgramDisplay.vue'

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: {
    type: String,
    default: 'Search or click to browse programs...'
  },
  programs: Object,
  otherProgram: String, // For filtering based on the other selected program
  isFromProgram: Boolean // Whether this is the "from" program selector
})

const emit = defineEmits(['update:modelValue', 'update:model-value'])

const { getReachablePrograms, getSourcePrograms, conversionData } = useConversions()

// Refs
const searchContainer = ref(null)
const searchInput = ref(null)
const dropdown = ref(null)

// State
const searchQuery = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
const inputId = computed(() => `program-search-${Math.random().toString(36).substr(2, 9)}`)

// Get all programs
const allPrograms = computed(() => {
  const programs = conversionData.value?.programs || props.programs
  if (!programs) return []
  
  return Object.entries(programs).map(([id, program]) => ({
    id,
    name: program.name,
    shortName: program.shortName,
    type: program.type,
    dollarValue: program.dollarValue
  }))
})

// Filter programs based on other selection
const availablePrograms = computed(() => {
  if (!props.otherProgram) {
    return allPrograms.value
  }
  
  let availableIds
  if (props.isFromProgram) {
    // This is the "from" selector, filter by what can reach the "to" program
    availableIds = getSourcePrograms(props.otherProgram)
  } else {
    // This is the "to" selector, filter by what the "from" program can reach
    availableIds = getReachablePrograms(props.otherProgram)
  }
  
  return allPrograms.value.filter(program => availableIds.has(program.id))
})

// Filter programs based on search query
const filteredPrograms = computed(() => {
  if (!searchQuery.value) {
    return availablePrograms.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return availablePrograms.value.filter(program => 
    program.name.toLowerCase().includes(query) ||
    program.type.toLowerCase().includes(query) ||
    program.id.toLowerCase().includes(query)
  )
})

// Group filtered programs by type
const groupedFilteredPrograms = computed(() => {
  const groups = { bank: [], hotel: [], airline: [] }
  
  filteredPrograms.value.forEach(program => {
    if (groups[program.type]) {
      groups[program.type].push(program)
    }
  })
  
  // Sort each group alphabetically
  Object.keys(groups).forEach(type => {
    groups[type].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return groups
})

// Display value in input
const displayValue = computed(() => {
  if (!props.modelValue) return searchQuery.value
  
  const selectedProgram = allPrograms.value.find(p => p.id === props.modelValue)
  return selectedProgram ? selectedProgram.name : searchQuery.value
})

// Show clear button when program is selected
const showClearButton = computed(() => {
  return !!props.modelValue
})

// Hint text
const availableHint = computed(() => {
  if (!props.otherProgram) {
    return `${availablePrograms.value.length} programs available`
  }
  
  const count = availablePrograms.value.length
  if (count === 0) {
    return 'No programs can transfer with the selected program'
  }
  
  return `${count} program${count === 1 ? '' : 's'} available for transfer`
})

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
  return filteredPrograms.value.findIndex(p => p.id === programId)
}

// Methods
const handleInput = (event) => {
  searchQuery.value = event.target.value
  showDropdown.value = true
  highlightedIndex.value = -1
  
  // Clear selection if user is typing
  if (props.modelValue) {
    emit('update:modelValue', '')
  }
}

const handleFocus = () => {
  showDropdown.value = true
  if (!props.modelValue) {
    searchQuery.value = ''
  }
  // Reset highlighted index when opening dropdown
  highlightedIndex.value = -1
}

const handleBlur = () => {
  // Delay hiding dropdown to allow for clicks
  setTimeout(() => {
    showDropdown.value = false
    
    // Reset search if no selection
    if (!props.modelValue) {
      searchQuery.value = ''
    }
  }, 300)
}

const handleKeydown = (event) => {
  if (!showDropdown.value) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredPrograms.value.length - 1)
      scrollToHighlighted()
      break
      
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      scrollToHighlighted()
      break
      
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredPrograms.value.length) {
        selectProgram(filteredPrograms.value[highlightedIndex.value])
      }
      break
      
    case 'Escape':
      showDropdown.value = false
      searchInput.value?.blur()
      break
  }
}

const selectProgram = (program) => {
  emit('update:modelValue', program.id)
  searchQuery.value = ''
  showDropdown.value = false
  searchInput.value?.blur()
}

const clearSelection = () => {
  emit('update:modelValue', '')
  searchQuery.value = ''
  searchInput.value?.focus()
}

const handleDropdownArrowClick = () => {
  if (!showDropdown.value) {
    searchInput.value?.focus()
  }
}

const scrollToHighlighted = () => {
  nextTick(() => {
    if (highlightedIndex.value >= 0) {
      const options = dropdown.value?.querySelectorAll('.program-option')
      if (options && options[highlightedIndex.value]) {
        options[highlightedIndex.value].scrollIntoView({
          block: 'nearest'
        })
      }
    }
  })
}

// Watch for external program changes to reset search
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
  }
})

// Reset highlighted index when filtered programs change
watch(filteredPrograms, () => {
  highlightedIndex.value = -1
})
</script>

<style scoped>
.program-search {
  position: relative;
  flex: 1;
  min-width: 150px;
}

.program-search label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.search-input-wrapper {
  position: relative;
}

.search-input-wrapper input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  background: white;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #3498db;
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  color: #6c757d;
  transition: all 0.2s;
}

.clear-button:hover {
  background: #e9ecef;
  color: #495057;
}

.dropdown-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  color: #6c757d;
  transition: all 0.2s;
  pointer-events: auto;
}

.search-input-wrapper:hover .dropdown-arrow {
  color: #495057;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #3498db;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 2px;
}

.dropdown-header {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #6c757d;
  border-bottom: 1px solid #f1f3f4;
}

.program-groups {
  padding: 0.5rem 0;
}

.program-group {
  margin-bottom: 0.5rem;
}

.program-group:last-child {
  margin-bottom: 0;
}

.group-header {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.program-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f3f4;
}

.program-option:last-child {
  border-bottom: none;
}

.program-option:hover,
.program-option.highlighted {
  background: #f8f9fa;
  transform: translateX(2px);
}

.program-option.highlighted {
  background: #e3f2fd;
  border-left: 3px solid #3498db;
}

.program-main {
  flex: 1;
}

.program-type {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: capitalize;
  margin-left: 0.5rem;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.hint {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #6c757d;
  text-align: center;
  border-top: 1px solid #f1f3f4;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .dropdown {
    max-height: 250px;
  }
  
  .program-option {
    padding: 1rem;
  }
}
</style>