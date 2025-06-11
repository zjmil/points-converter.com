<template>
  <div class="advanced-settings">
    <div class="settings-header" @click="toggleExpanded">
      <h3>Advanced Settings</h3>
      <span class="expand-icon">{{ isExpanded ? '−' : '+' }}</span>
    </div>
    
    <div v-if="isExpanded" class="settings-content">
      <p class="settings-description">
        Customize the estimated cents per point value for each program. These values are used when "Show dollar values" is enabled.
      </p>
      
      <div class="toggle-row">
        <label class="toggle-label">
          <input type="checkbox" v-model="multiStepEnabled" @change="persistMultiStep" />
          Show multi-step conversions (not recommended)
        </label>
      </div>
      
      <div class="program-groups">
        <div v-for="(groupPrograms, groupName) in groupedPrograms" :key="groupName" class="program-group">
          <h4 class="group-title">{{ getGroupDisplayName(groupName) }}</h4>
          <table class="program-table">
            <thead>
              <tr>
                <th>Program</th>
                <th style="width: 120px;">Cents/pt</th>
                <th style="width: 60px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="program in groupPrograms" :key="program.id">
                <td class="program-label">{{ program.name }}</td>
                <td>
                  <input
                    :id="`cents-${program.id}`"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    :value="getCentsValue(program.id)"
                    @input="updateCentsValue(program.id, $event.target.value)"
                    class="cents-input"
                  >
                  <span class="cents-symbol">¢</span>
                </td>
                <td>
                  <button 
                    @click="resetToDefault(program.id)"
                    class="reset-button"
                    type="button"
                  >
                    Reset
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  programs: Object,
  customDollarValues: Object
})

const emit = defineEmits(['update:customDollarValues', 'update:multiStepEnabled'])

const isExpanded = ref(false)
const multiStepEnabled = ref(false)

const LOCAL_KEY = 'points-converter-settings'

const persistSettings = (customValues) => {
  const settings = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
  settings.customDollarValues = customValues
  localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
}

const persistMultiStep = () => {
  const settings = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
  settings.multiStepEnabled = multiStepEnabled.value
  localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
  emit('update:multiStepEnabled', multiStepEnabled.value)
}

onMounted(() => {
  const settings = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
  if (settings.customDollarValues) {
    emit('update:customDollarValues', settings.customDollarValues)
  }
  if (typeof settings.multiStepEnabled === 'boolean') {
    multiStepEnabled.value = settings.multiStepEnabled
    emit('update:multiStepEnabled', multiStepEnabled.value)
  }
})

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

const getCentsValue = (programId) => {
  // Convert dollar value to cents
  const dollarValue = getDollarValue(programId)
  return (dollarValue * 100).toFixed(2)
}

const getDollarValue = (programId) => {
  // Return custom value if set, otherwise default value
  if (props.customDollarValues && props.customDollarValues[programId] !== undefined) {
    return props.customDollarValues[programId]
  }
  return props.programs[programId]?.dollarValue || 0
}

const updateCentsValue = (programId, value) => {
  const numValue = parseFloat(value)
  if (isNaN(numValue) || numValue < 0) return
  
  // Convert cents to dollars
  const dollarValue = numValue / 100
  
  const newCustomValues = { ...props.customDollarValues }
  newCustomValues[programId] = dollarValue
  
  emit('update:customDollarValues', newCustomValues)
  persistSettings(newCustomValues)
}

const resetToDefault = (programId) => {
  const newCustomValues = { ...props.customDollarValues }
  delete newCustomValues[programId]
  
  emit('update:customDollarValues', newCustomValues)
  persistSettings(newCustomValues)
}

const resetAllToDefaults = () => {
  emit('update:customDollarValues', {})
  persistSettings({})
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

.toggle-row {
  margin-bottom: 1.5rem;
}

.toggle-label {
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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

.program-table {
  width: 100%;
  border-collapse: collapse;
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.program-table th, .program-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.program-table th {
  background: #e9ecef;
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
}

.program-table tr:nth-child(even) {
  background: #f4f6f8;
}

.program-label {
  font-weight: 500;
  color: #2c3e50;
}

.cents-input {
  width: 70px;
  padding: 0.4rem 1.5rem 0.4rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: right;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.cents-input::-webkit-outer-spin-button,
.cents-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cents-input[type=number]::-ms-input-spin-button {
  display: none;
}

.cents-symbol {
  margin-left: 0.2rem;
  color: #666;
  font-weight: 500;
  font-size: 0.95em;
  vertical-align: middle;
}

.reset-button {
  padding: 0.2rem 0.7rem;
  background: #e9ecef;
  border: none;
  border-radius: 4px;
  color: #495057;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  align-self: center;
}

.reset-button:hover {
  background: #dee2e6;
}

.settings-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.reset-all-button {
  padding: 0.75rem 1.5rem;
  background: #e9ecef;
  border: none;
  border-radius: 4px;
  color: #495057;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-all-button:hover {
  background: #dee2e6;
}
</style>