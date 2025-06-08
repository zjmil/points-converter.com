<template>
  <div class="results">
    <h2>Conversion Results</h2>
    
    <div class="conversion-path">{{ conversionPath }}</div>
    
    <div class="conversion-details" v-html="conversionDetails"></div>
    
    <!-- Multi-step alternatives -->
    <div v-if="hasAlternatives" class="multi-step">
      <h3>{{ alternativeTitle }}</h3>
      <div class="alternative-routes">
        <div 
          v-for="(route, index) in displayRoutes" 
          :key="index"
          class="conversion-step"
        >
          <h4>{{ route.title }}</h4>
          <ol>
            <li v-for="step in route.steps" :key="step.text">
              {{ step.text }}
              <span v-if="step.hasBonus" class="bonus-indicator">BONUS</span>
            </li>
          </ol>
          <p><strong>Total Rate:</strong> 1:{{ route.totalRate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  results: Object
})

const conversionPath = computed(() => {
  if (!props.results) return ''
  
  const { amount, directConversion, multiStepRoutes, programs, fromProgram, toProgram } = props.results
  const fromName = programs[fromProgram]?.name || ''
  const toName = programs[toProgram]?.name || ''
  
  if (directConversion) {
    const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate
    const result = Math.floor(amount * rate)
    return `${amount.toLocaleString()} ${fromName} → ${result.toLocaleString()} ${toName}`
  } else if (multiStepRoutes.length > 0) {
    return 'No direct conversion available'
  } else {
    return 'No conversion path found'
  }
})

const conversionDetails = computed(() => {
  if (!props.results?.directConversion) {
    if (props.results?.multiStepRoutes?.length > 0) {
      return '<p>Consider these multi-step conversion routes:</p>'
    } else {
      return '<p>Unfortunately, there is no direct or 2-step conversion path between these programs.</p>'
    }
  }
  
  const { directConversion } = props.results
  const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate
  
  let detailsHTML = `
    <p><strong>Exchange Rate:</strong> 1:${rate}</p>
    <p><strong>Transfer Type:</strong> ${directConversion.instantTransfer ? 'Instant' : 'May take 1-2 days'}</p>
  `
  
  if (directConversion.bonus) {
    detailsHTML += `
      <p class="bonus-info">
        <span class="bonus-indicator">BONUS ACTIVE</span>
        Regular rate: 1:${directConversion.rate} → Bonus rate: 1:${directConversion.bonusRate}
        ${directConversion.bonusEndDate ? ` (Ends ${new Date(directConversion.bonusEndDate).toLocaleDateString()})` : ''}
      </p>
    `
  }
  
  if (directConversion.note) {
    detailsHTML += `<p><strong>Note:</strong> ${directConversion.note}</p>`
  }
  
  return detailsHTML
})

const hasAlternatives = computed(() => {
  if (!props.results) return false
  
  const { directConversion, multiStepRoutes } = props.results
  
  // Show alternatives if we have a direct conversion AND multi-step routes
  // OR if we only have multi-step routes (no direct conversion)
  return (directConversion && multiStepRoutes.length > 0) || 
         (!directConversion && multiStepRoutes.length > 0)
})

const alternativeTitle = computed(() => {
  if (!props.results) return ''
  
  const { directConversion, multiStepRoutes } = props.results
  
  if (directConversion && multiStepRoutes.length > 0) {
    return 'Alternative Routes'
  } else if (!directConversion && multiStepRoutes.length > 0) {
    return 'Available Routes'
  }
  
  return 'Routes'
})

const displayRoutes = computed(() => {
  if (!props.results?.multiStepRoutes) return []
  
  const { amount, multiStepRoutes, programs, toProgram } = props.results
  const toName = programs[toProgram]?.name || ''
  
  return multiStepRoutes.map((route, index) => {
    const result = Math.floor(amount * route.totalRate)
    const isAlternative = props.results.directConversion
    
    const title = isAlternative 
      ? `Alternative ${index + 1}: ${result.toLocaleString()} ${toName}`
      : `Route ${index + 1}: ${result.toLocaleString()} ${toName}`
    
    let currentAmount = amount
    const steps = route.steps.map(step => {
      const stepRate = step.bonus ? step.bonusRate : step.rate
      const stepResult = Math.floor(currentAmount * stepRate)
      const stepFromName = programs[step.from]?.name || ''
      const stepToName = programs[step.to]?.name || ''
      
      const text = `${currentAmount.toLocaleString()} ${stepFromName} → ${stepResult.toLocaleString()} ${stepToName} (1:${stepRate})`
      
      currentAmount = stepResult
      
      return {
        text,
        hasBonus: step.bonus
      }
    })
    
    return {
      title,
      steps,
      totalRate: route.totalRate.toFixed(2)
    }
  })
})
</script>

<style scoped>
.results {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.results h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.conversion-path {
  font-size: 1.5rem;
  font-weight: 600;
  color: #27ae60;
  margin-bottom: 1rem;
}

.conversion-details {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  margin-bottom: 1rem;
}

.multi-step {
  margin-top: 2rem;
}

.multi-step h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.conversion-step {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #e74c3c;
}

.conversion-step h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.conversion-step ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.conversion-step li {
  margin-bottom: 0.25rem;
}

.bonus-indicator {
  display: inline-block;
  background-color: #27ae60;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

:deep(.bonus-info) {
  background-color: #e8f5e8;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #27ae60;
  margin-top: 0.5rem;
}
</style>