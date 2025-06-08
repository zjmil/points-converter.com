<template>
  <span class="program-icon" :class="iconClass">
    {{ iconSymbol }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  programId: String,
  type: String,
  size: {
    type: String,
    default: 'small' // small, medium, large
  }
})

const iconSymbol = computed(() => {
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
  }

  if (specificIcons[props.programId]) {
    return specificIcons[props.programId]
  }

  // Fallback based on type
  const typeIcons = {
    'bank': '🏦',
    'hotel': '🏨',
    'airline': '✈️'
  }

  return typeIcons[props.type] || '💳'
})

const iconClass = computed(() => {
  return [
    `icon-${props.size}`,
    `icon-${props.type}`,
    props.programId ? `icon-${props.programId}` : ''
  ]
})
</script>

<style scoped>
.program-icon {
  display: inline-block;
  margin-right: 0.5rem;
  font-style: normal;
  line-height: 1;
}

.icon-small {
  font-size: 1rem;
}

.icon-medium {
  font-size: 1.25rem;
}

.icon-large {
  font-size: 1.5rem;
}

/* Type-specific styling */
.icon-bank {
  filter: hue-rotate(210deg); /* Blue tint for banks */
}

.icon-hotel {
  filter: hue-rotate(120deg); /* Green tint for hotels */
}

.icon-airline {
  filter: hue-rotate(0deg); /* Keep original color for airlines */
}

/* Specific program styling could be added here */
.icon-chase_ur {
  color: #003087; /* Chase blue */
}

.icon-amex_mr {
  color: #006FCF; /* Amex blue */
}

.icon-hyatt {
  color: #943126; /* Hyatt red */
}

.icon-marriott {
  color: #B8860B; /* Marriott gold */
}

.icon-united {
  color: #0039A6; /* United blue */
}

.icon-delta {
  color: #CE0037; /* Delta red */
}

.icon-american {
  color: #C41E3A; /* American red */
}
</style>