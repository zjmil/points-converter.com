<template>
  <div class="advanced-settings">
    <div class="settings-header" @click="toggleExpanded">
      <h3>Advanced Settings</h3>
      <span class="expand-icon">{{ isExpanded ? '−' : '+' }}</span>
    </div>
    
    <div v-if="isExpanded" class="settings-content">
      <p class="settings-description">
        Customize the estimated dollar value per point for each program. These values are used when "Show dollar values" is enabled.
      </p>
      
      <div class="program-groups">
        <div v-for="(groupPrograms, groupName) in groupedPrograms" :key="groupName" class="program-group">
          <h4 class="group-title">{{ getGroupDisplayName(groupName) }}</h4>
          <div class="program-list">
            <div v-for="program in groupPrograms" :key="program.id" class="program-setting">
              <label :for="`dollar-${program.id}`" class="program-label">
                {{ program.name }}
              </label>
              <div class="input-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  :id="`dollar-${program.id}`"
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  :value="getDollarValue(program.id)"
                  @input="updateDollarValue(program.id, $event.target.value)"
                  class="dollar-input"
                >
              </div>
              <button 
                @click="resetToDefault(program.id)"
                class="reset-button"
                type="button"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-actions">
        <button @click="resetAllToDefaults" class="reset-all-button" type="button">
          Reset All to Defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  programs: Object,
  customDollarValues: Object
})

const emit = defineEmits(['update:customDollarValues'])

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Group programs by type
const groupedPrograms = computed(() => {
  if (!props.programs) return { bank: [], hotel: [], airline: [] }
  
  const groups = { bank: [], hotel: [], airline: [] }
  
  Object.entries(props.programs).forEach(([id, program]) => {
    const prog = { id, name: program.name, type: program.type, defaultValue: program.dollarValue || 0 }
    if (groups[program.type]) {
      groups[program.type].push(prog)
    }
  })
  
  // Sort each group alphabetically
  Object.keys(groups).forEach(type => {
    groups[type].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return groups
})

const getGroupDisplayName = (groupName) => {
  const names = {
    bank: 'Bank Points',
    hotel: 'Hotel Programs', 
    airline: 'Airline Programs'
  }
  return names[groupName] || groupName
}

const getDollarValue = (programId) => {
  // Return custom value if set, otherwise default value
  if (props.customDollarValues && props.customDollarValues[programId] !== undefined) {
    return props.customDollarValues[programId]
  }
  return props.programs[programId]?.dollarValue || 0
}

const updateDollarValue = (programId, value) => {
  const numValue = parseFloat(value)
  if (isNaN(numValue) || numValue < 0) return
  
  const newCustomValues = { ...props.customDollarValues }
  newCustomValues[programId] = numValue
  
  emit('update:customDollarValues', newCustomValues)
}

const resetToDefault = (programId) => {
  const newCustomValues = { ...props.customDollarValues }
  delete newCustomValues[programId]
  
  emit('update:customDollarValues', newCustomValues)
}

const resetAllToDefaults = () => {
  emit('update:customDollarValues', {})
}
</script>

<style scoped>
.advanced-settings {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
}

.settings-header:hover {
  background: #e9ecef;
}

.settings-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.expand-icon {
  font-weight: bold;
  font-size: 1.2rem;
  color: #3498db;
}

.settings-content {
  padding: 1.5rem;
}

.settings-description {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.program-groups {
  margin-bottom: 1.5rem;
}

.program-group {
  margin-bottom: 2rem;
}

.program-group:last-child {
  margin-bottom: 0;
}

.group-title {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.program-list {
  display: grid;
  gap: 1rem;
}

.program-setting {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.program-label {
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 0.75rem;
  color: #666;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
}

.dollar-input {
  width: 100px;
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: right;
}

.dollar-input:focus {
  outline: none;
  border-color: #3498db;
}

.reset-button {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background: #5a6268;
}

.settings-actions {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  text-align: center;
}

.reset-all-button {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-all-button:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .program-setting {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }
  
  .program-label {
    justify-self: start;
    text-align: left;
  }
}
</style>