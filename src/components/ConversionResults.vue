<template>
  <div class="results">
    <h2>Conversion Results</h2>
    
    <div class="conversion-path">
      <span v-if="results?.directConversion || results?.multiStepRoutes?.length > 0" class="conversion-visual">
        <ProgramIcon 
          v-if="results.fromProgram" 
          :programId="results.fromProgram"
          :type="results.programs?.[results.fromProgram]?.type"
          size="medium"
        />
        <span class="desktop-path">{{ conversionPath }}</span>
        <span class="mobile-path">{{ conversionPathMobile }}</span>
        <ProgramIcon 
          v-if="results.toProgram" 
          :programId="results.toProgram"
          :type="results.programs?.[results.toProgram]?.type"
          size="medium"
        />
      </span>
      <span v-else>{{ conversionPath }}</span>
    </div>
    
    <div class="conversion-details" v-html="conversionDetails"></div>
    
    <!-- Multi-step alternatives -->
    <div v-if="hasAlternatives" class="multi-step">
      <h3>{{ alternativeTitle }}</h3>
      <div class="alternative-routes">
        <div 
          v-for="(route, index) in displayRoutes" 
          :key="index"
          class="conversion-step"
          :class="{ 'clickable': !route.isExpanded, 'expanded': route.isExpanded }"
          @click="toggleRouteDetails(index)"
        >
          <h4>
            {{ route.title }}
            <span class="expand-icon">{{ route.isExpanded ? '−' : '+' }}</span>
          </h4>
          
          <div v-if="!route.isExpanded" class="route-summary">
            <p><strong>Total Rate:</strong> 1:{{ route.totalRate }}</p>
            <p class="click-hint">Click for details</p>
          </div>
          
          <div v-else class="route-details">
            <ol>
              <li v-for="step in route.steps" :key="step.text">
                {{ step.text }}
                <span v-if="step.hasBonus" class="bonus-indicator">BONUS</span>
              </li>
            </ol>
            
            <div class="step-details">
              <p><strong>Total Rate:</strong> 1:{{ route.totalRate }}</p>
              <div v-for="(step, stepIndex) in route.stepDetails" :key="stepIndex" class="step-info">
                <p><strong>Step {{ stepIndex + 1 }}:</strong></p>
                <ul>
                  <li><strong>Exchange Rate:</strong> 1:{{ step.rate }}</li>
                  <li><strong>Transfer Type:</strong> {{ step.instantTransfer ? 'Instant' : 'May take 1-2 days' }}</li>
                  <li v-if="step.minAmount"><strong>Minimum Amount:</strong> {{ step.minAmount.toLocaleString() }} points</li>
                  <li v-if="step.lastUpdated"><strong>Last Updated:</strong> {{ new Date(step.lastUpdated).toLocaleDateString() }}</li>
                  <li v-if="step.bonus" class="bonus-info">
                    <span class="bonus-indicator">BONUS ACTIVE</span>
                    Regular rate: 1:{{ step.baseRate }} → Bonus rate: 1:{{ step.bonusRate }}
                    <span v-if="step.bonusEndDate"> (Ends {{ new Date(step.bonusEndDate).toLocaleDateString() }})</span>
                  </li>
                  <li v-if="step.note"><strong>Note:</strong> {{ step.note }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDollarValues } from '../composables/useDollarValues'
import ProgramIcon from './ProgramIcon.vue'

const props = defineProps({
  results: Object,
  showDollarValues: Boolean,
  customDollarValues: Object
})

const { formatPointsWithDollar } = useDollarValues()

// Track which routes are expanded
const expandedRoutes = ref(new Set())

// Toggle route details
const toggleRouteDetails = (index) => {
  if (expandedRoutes.value.has(index)) {
    expandedRoutes.value.delete(index)
  } else {
    expandedRoutes.value.add(index)
  }
}

const conversionPath = computed(() => {
  if (!props.results) return ''
  
  const { amount, directConversion, multiStepRoutes, programs, fromProgram, toProgram } = props.results
  const fromName = programs[fromProgram]?.name || ''
  const toName = programs[toProgram]?.name || ''
  
  if (directConversion) {
    const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate
    const result = Math.floor(amount * rate)
    
    const fromText = formatPointsWithDollar(amount, fromProgram, programs, props.showDollarValues, props.customDollarValues)
    const toText = formatPointsWithDollar(result, toProgram, programs, props.showDollarValues, props.customDollarValues)
    
    return `${fromText} ${fromName} → ${toText} ${toName}`
  } else if (multiStepRoutes.length > 0) {
    return 'No direct conversion available'
  } else {
    return 'No conversion path found'
  }
})

// Mobile version with short names for space constraints
const conversionPathMobile = computed(() => {
  if (!props.results) return ''
  
  const { amount, directConversion, multiStepRoutes, programs, fromProgram, toProgram } = props.results
  const fromShortName = programs[fromProgram]?.shortName || programs[fromProgram]?.name || ''
  const toShortName = programs[toProgram]?.shortName || programs[toProgram]?.name || ''
  
  if (directConversion) {
    const rate = directConversion.bonus ? directConversion.bonusRate : directConversion.rate
    const result = Math.floor(amount * rate)
    
    const fromText = formatPointsWithDollar(amount, fromProgram, programs, props.showDollarValues, props.customDollarValues)
    const toText = formatPointsWithDollar(result, toProgram, programs, props.showDollarValues, props.customDollarValues)
    
    return `${fromText} ${fromShortName} → ${toText} ${toShortName}`
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
  
  if (directConversion.minAmount) {
    const { amount } = props.results
    if (amount < directConversion.minAmount) {
      detailsHTML += `
        <p class="warning-info">
          <span class="warning-icon">⚠️</span>
          Minimum transfer amount: ${directConversion.minAmount.toLocaleString()} points
        </p>
      `
    } else {
      detailsHTML += `<p><strong>Minimum Amount:</strong> ${directConversion.minAmount.toLocaleString()} points</p>`
    }
  }
  
  if (directConversion.lastUpdated) {
    const lastUpdated = new Date(directConversion.lastUpdated).toLocaleDateString()
    detailsHTML += `<p><strong>Last Updated:</strong> ${lastUpdated}</p>`
  }
  
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
    const isExpanded = expandedRoutes.value.has(index)
    
    const resultText = formatPointsWithDollar(result, toProgram, programs, props.showDollarValues, props.customDollarValues)
    const title = isAlternative 
      ? `Alternative ${index + 1}: ${resultText} ${toName}`
      : `Route ${index + 1}: ${resultText} ${toName}`
    
    let currentAmount = amount
    const steps = route.steps.map(step => {
      const stepRate = step.bonus ? step.bonusRate : step.rate
      const stepResult = Math.floor(currentAmount * stepRate)
      const stepFromName = programs[step.from]?.name || ''
      const stepToName = programs[step.to]?.name || ''
      
      const fromText = formatPointsWithDollar(currentAmount, step.from, programs, props.showDollarValues, props.customDollarValues)
      const toText = formatPointsWithDollar(stepResult, step.to, programs, props.showDollarValues, props.customDollarValues)
      
      const text = `${fromText} ${stepFromName} → ${toText} ${stepToName} (1:${stepRate})`
      
      currentAmount = stepResult
      
      return {
        text,
        hasBonus: step.bonus
      }
    })
    
    // Create detailed step information for expanded view
    const stepDetails = route.steps.map(step => ({
      rate: step.bonus ? step.bonusRate : step.rate,
      baseRate: step.rate,
      bonusRate: step.bonusRate,
      bonus: step.bonus,
      bonusEndDate: step.bonusEndDate,
      instantTransfer: step.instantTransfer,
      minAmount: step.minAmount,
      lastUpdated: step.lastUpdated,
      note: step.note
    }))
    
    return {
      title,
      steps,
      stepDetails,
      totalRate: route.totalRate.toFixed(2),
      isExpanded
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

.conversion-visual {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-path {
  display: none;
}

@media (max-width: 768px) {
  .desktop-path {
    display: none;
  }
  
  .mobile-path {
    display: inline;
  }
  
  .conversion-path {
    font-size: 1.2rem;
  }
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
  transition: all 0.3s ease;
}

.conversion-step.clickable {
  cursor: pointer;
  border-left-color: #3498db;
}

.conversion-step.clickable:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.conversion-step.expanded {
  border-left-color: #27ae60;
  background-color: #f0f8f0;
}

.conversion-step h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expand-icon {
  font-weight: bold;
  font-size: 1.2rem;
  color: #3498db;
}

.route-summary {
  margin: 0.5rem 0;
}

.click-hint {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
}

.route-details {
  margin-top: 1rem;
}

.step-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.step-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.step-info ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
}

.step-info li {
  margin-bottom: 0.25rem;
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

:deep(.warning-info) {
  background-color: #fff3cd;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #ffc107;
  margin-top: 0.5rem;
  color: #856404;
}

:deep(.warning-icon) {
  margin-right: 0.5rem;
}
</style>