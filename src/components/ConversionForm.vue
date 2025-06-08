<template>
  <div class="conversion-form">
    <div class="form-group">
      <label for="fromAmount">Amount</label>
      <input 
        id="fromAmount"
        type="number" 
        :value="amount"
        @input="$emit('update:amount', parseInt($event.target.value))"
        min="1"
        @keypress.enter="$emit('convert')"
      >
    </div>

    <div class="form-group">
      <label for="fromProgram">From</label>
      <select 
        id="fromProgram"
        :value="fromProgram"
        @change="$emit('update:fromProgram', $event.target.value)"
      >
        <option value="">{{ fromPlaceholder }}</option>
        <optgroup v-if="filteredFromPrograms.bank.length" label="Bank Points">
          <option v-for="prog in filteredFromPrograms.bank" :key="prog.id" :value="prog.id">
            {{ prog.name }}
          </option>
        </optgroup>
        <optgroup v-if="filteredFromPrograms.hotel.length" label="Hotel Programs">
          <option v-for="prog in filteredFromPrograms.hotel" :key="prog.id" :value="prog.id">
            {{ prog.name }}
          </option>
        </optgroup>
        <optgroup v-if="filteredFromPrograms.airline.length" label="Airline Programs">
          <option v-for="prog in filteredFromPrograms.airline" :key="prog.id" :value="prog.id">
            {{ prog.name }}
          </option>
        </optgroup>
      </select>
    </div>

    <div class="arrow">→</div>

    <div class="form-group">
      <label for="toProgram">To</label>
      <select 
        id="toProgram"
        :value="toProgram"
        @change="$emit('update:toProgram', $event.target.value)"
      >
        <option value="">{{ toPlaceholder }}</option>
        <optgroup v-if="filteredToPrograms.bank.length" label="Bank Points">
          <option v-for="prog in filteredToPrograms.bank" :key="prog.id" :value="prog.id">
            {{ prog.name }}
          </option>
        </optgroup>
        <optgroup v-if="filteredToPrograms.hotel.length" label="Hotel Programs">
          <option v-for="prog in filteredToPrograms.hotel" :key="prog.id" :value="prog.id">
            {{ prog.name }}
          </option>
        </optgroup>
        <optgroup v-if="filteredToPrograms.airline.length" label="Airline Programs">
          <option v-for="prog in filteredToPrograms.airline" :key="prog.id" :value="prog.id">
            {{ prog.name }}
          </option>
        </optgroup>
      </select>
    </div>

    <button 
      class="convert-btn"
      @click="$emit('convert')"
      :disabled="!amount || !fromProgram || !toProgram"
    >
      Convert
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConversions } from '../composables/useConversions'

const props = defineProps({
  fromProgram: String,
  toProgram: String,
  amount: Number,
  programs: Object,
  conversions: Array
})

defineEmits(['update:fromProgram', 'update:toProgram', 'update:amount', 'convert'])

const { getReachablePrograms, getSourcePrograms, conversionData } = useConversions()

// Group programs by type
const groupedPrograms = computed(() => {
  const programs = conversionData.value?.programs || props.programs
  if (!programs) return { bank: [], hotel: [], airline: [] }
  
  const groups = { bank: [], hotel: [], airline: [] }
  
  Object.entries(programs).forEach(([id, program]) => {
    const prog = { id, name: program.name, type: program.type }
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

// Filter from programs based on to selection
const filteredFromPrograms = computed(() => {
  if (!props.toProgram) {
    return groupedPrograms.value
  }
  
  const sourcePrograms = getSourcePrograms(props.toProgram)
  const filtered = { bank: [], hotel: [], airline: [] }
  
  Object.keys(filtered).forEach(type => {
    filtered[type] = groupedPrograms.value[type].filter(prog => 
      sourcePrograms.has(prog.id)
    )
  })
  
  return filtered
})

// Filter to programs based on from selection
const filteredToPrograms = computed(() => {
  if (!props.fromProgram) {
    return groupedPrograms.value
  }
  
  const reachablePrograms = getReachablePrograms(props.fromProgram)
  const filtered = { bank: [], hotel: [], airline: [] }
  
  Object.keys(filtered).forEach(type => {
    filtered[type] = groupedPrograms.value[type].filter(prog => 
      reachablePrograms.has(prog.id)
    )
  })
  
  return filtered
})

// Dynamic placeholders
const fromPlaceholder = computed(() => {
  if (!props.toProgram) return 'Select a program'
  
  const sourcePrograms = getSourcePrograms(props.toProgram)
  if (sourcePrograms.size === 0) {
    return 'No programs can transfer to this destination'
  }
  return `Select from ${sourcePrograms.size} program${sourcePrograms.size === 1 ? '' : 's'} that can transfer here`
})

const toPlaceholder = computed(() => {
  if (!props.fromProgram) return 'Select a program'
  
  const reachablePrograms = getReachablePrograms(props.fromProgram)
  if (reachablePrograms.size === 0) {
    return 'No transfer partners available'
  }
  return `Select from ${reachablePrograms.size} transfer partner${reachablePrograms.size === 1 ? '' : 's'}`
})
</script>

<style scoped>
.conversion-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.arrow {
  font-size: 2rem;
  color: #3498db;
  padding: 0 0.5rem;
  align-self: center;
}

.convert-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.convert-btn:hover {
  background-color: #2980b9;
}

.convert-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .conversion-form {
    flex-direction: column;
  }
  
  .arrow {
    transform: rotate(90deg);
    margin: 1rem 0;
  }
}
</style>