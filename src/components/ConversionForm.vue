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
      >
      <div v-if="showDollarValues && fromProgram && amountDollarValue" class="dollar-hint">
        {{ amountDollarValue }}
      </div>
    </div>

    <ProgramSearch
      v-model="fromProgram"
      label="From"
      placeholder="Search or click to choose source program..."
      :programs="programs"
      :other-program="toProgram"
      :is-from-program="true"
      @update:model-value="$emit('update:fromProgram', $event)"
    />

    <div class="arrow">→</div>

    <ProgramSearch
      v-model="toProgram"
      label="To"
      placeholder="Search or click to choose destination..."
      :programs="programs"
      :other-program="fromProgram"
      :is-from-program="false"
      @update:model-value="$emit('update:toProgram', $event)"
    />

  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgramSearch from './ProgramSearch.vue'
import { useConversions } from '../composables/useConversions'
import { useDollarValues } from '../composables/useDollarValues'

const props = defineProps({
  fromProgram: String,
  toProgram: String,
  amount: Number,
  programs: Object,
  conversions: Array,
  showDollarValues: Boolean,
  customDollarValues: Object
})

const emit = defineEmits(['update:fromProgram', 'update:toProgram', 'update:amount'])

const { formatDollarValue, getProgramDollarValue } = useDollarValues()

// Computed refs for v-model binding
const fromProgram = computed({
  get: () => props.fromProgram,
  set: (value) => emit('update:fromProgram', value)
})

const toProgram = computed({
  get: () => props.toProgram,
  set: (value) => emit('update:toProgram', value)
})

// Calculate dollar value for current amount
const amountDollarValue = computed(() => {
  if (!props.fromProgram || !props.amount || !props.programs) return null
  
  const dollarValue = getProgramDollarValue(props.fromProgram, props.programs, props.customDollarValues)
  if (!dollarValue) return null
  
  return formatDollarValue(props.amount, dollarValue)
})

// The filtering logic is now handled by the ProgramSearch component
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.dollar-hint {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
  font-style: italic;
}

.arrow {
  font-size: 2rem;
  color: #3498db;
  padding: 0 0.5rem;
  align-self: center;
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