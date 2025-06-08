<template>
  <span class="program-display" :class="displayClass">
    <ProgramIcon 
      :programId="programId"
      :type="program?.type"
      :size="iconSize"
    />
    <span class="program-text">
      {{ displayText }}
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import ProgramIcon from './ProgramIcon.vue'

const props = defineProps({
  programId: String,
  program: Object,
  showShortName: {
    type: Boolean,
    default: false
  },
  iconSize: {
    type: String,
    default: 'small'
  },
  variant: {
    type: String,
    default: 'default' // default, compact, full
  }
})

const displayText = computed(() => {
  if (!props.program) return props.programId || ''
  
  if (props.variant === 'compact' && props.program.shortName) {
    return props.program.shortName
  }
  
  if (props.showShortName && props.program.shortName) {
    return `${props.program.name} (${props.program.shortName})`
  }
  
  return props.program.name
})

const displayClass = computed(() => {
  return [
    `variant-${props.variant}`,
    props.program?.type ? `type-${props.program.type}` : ''
  ]
})
</script>

<style scoped>
.program-display {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.program-text {
  font-weight: 500;
}

.variant-compact .program-text {
  font-size: 0.9rem;
  font-weight: 600;
}

.variant-full .program-text {
  font-size: 1.1rem;
}

/* Type-specific text colors to match icons */
.type-bank .program-text {
  color: #2c5aa0;
}

.type-hotel .program-text {
  color: #22543d;
}

.type-airline .program-text {
  color: #1a202c;
}
</style>