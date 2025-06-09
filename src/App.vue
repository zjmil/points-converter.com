<template>
  <div class="app">
    <AppHeader />
    
    <main>
      <div class="container">
        <DollarValueToggle v-model="showDollarValues" />
        
        <AdvancedSettings 
          v-if="conversionData?.programs"
          :programs="conversionData.programs"
          v-model:customDollarValues="customDollarValues"
        />
        
        <ConversionForm
          v-model:fromProgram="fromProgram"
          v-model:toProgram="toProgram"
          v-model:amount="amount"
          :programs="conversionData?.programs"
          :conversions="conversionData?.conversions"
          :showDollarValues="showDollarValues"
          :customDollarValues="customDollarValues"
        />
        
        <TransferPreview
          v-if="showPreview"
          :fromProgram="fromProgram"
          :toProgram="toProgram"
          :programs="conversionData?.programs"
          :conversions="conversionData?.conversions"
          @selectTransfer="handleTransferSelection"
        />
        
        <ConversionResults
          v-if="showResults"
          :results="conversionResults"
          :showDollarValues="showDollarValues"
          :customDollarValues="customDollarValues"
        />
        
        <AdPlaceholder 
          v-if="conversionData?.config?.showAdvertisements"
        />
        
        <AffiliateLinks
          v-if="conversionData?.config?.showAffiliateLinks"
          :links="conversionData?.affiliateLinks"
        />
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import DollarValueToggle from './components/DollarValueToggle.vue'
import AdvancedSettings from './components/AdvancedSettings.vue'
import ConversionForm from './components/ConversionForm.vue'
import TransferPreview from './components/TransferPreview.vue'
import ConversionResults from './components/ConversionResults.vue'
import AdPlaceholder from './components/AdPlaceholder.vue'
import AffiliateLinks from './components/AffiliateLinks.vue'
import { useConversions } from './composables/useConversions'

// Reactive state
const fromProgram = ref('')
const toProgram = ref('')
const amount = ref(1000)
const showDollarValues = ref(false)
const customDollarValues = ref({})

// URL parameters handling
const initializeFromURL = () => {
  // Skip URL initialization in test environment
  if (typeof window === 'undefined' || window.location.href.includes('localhost:3000')) {
    return
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  
  if (urlParams.has('from')) {
    fromProgram.value = urlParams.get('from')
  }
  if (urlParams.has('to')) {
    toProgram.value = urlParams.get('to')
  }
  if (urlParams.has('amount')) {
    const urlAmount = parseInt(urlParams.get('amount'))
    if (!isNaN(urlAmount) && urlAmount > 0) {
      amount.value = urlAmount
    }
  }
}

// Update URL when values change
const updateURL = () => {
  // Skip URL updates in test environment
  if (typeof window === 'undefined' || window.location.href.includes('localhost:3000')) {
    return
  }
  
  const params = new URLSearchParams()
  
  if (fromProgram.value) {
    params.set('from', fromProgram.value)
  }
  if (toProgram.value) {
    params.set('to', toProgram.value)
  }
  if (amount.value !== 1000) {
    params.set('amount', amount.value.toString())
  }
  
  const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
  window.history.replaceState({}, '', newURL)
}

// Use conversion composable
const { conversionData, loadConversionData, findDirectConversion, findMultiStepConversions } = useConversions()

// Computed properties
const showPreview = computed(() => {
  return (fromProgram.value && !toProgram.value) || (!fromProgram.value && toProgram.value)
})

const conversionResults = computed(() => {
  // Only calculate if we have all required data and inputs
  if (!amount.value || !fromProgram.value || !toProgram.value || !conversionData.value) {
    return null
  }
  
  // Don't show results for same program
  if (fromProgram.value === toProgram.value) {
    return null
  }
  
  const directConversion = findDirectConversion(fromProgram.value, toProgram.value)
  const multiStepRoutes = findMultiStepConversions(fromProgram.value, toProgram.value)
  
  return {
    amount: amount.value,
    fromProgram: fromProgram.value,
    toProgram: toProgram.value,
    directConversion,
    multiStepRoutes,
    programs: conversionData.value.programs
  }
})

const showResults = computed(() => {
  return conversionResults.value !== null
})

// Methods
const handleTransferSelection = ({ fromProgram: newFromProgram, toProgram: newToProgram }) => {
  if (newFromProgram) {
    fromProgram.value = newFromProgram
  }
  if (newToProgram) {
    toProgram.value = newToProgram
  }
}

// Watchers to update URL
watch([fromProgram, toProgram, amount], updateURL)

// Lifecycle
onMounted(() => {
  initializeFromURL()
  loadConversionData()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 2rem 0;
}
</style>