<template>
  <div class="app">
    <AppHeader />
    
    <main>
      <div class="container">
        <DataInfo 
          :lastUpdated="conversionData?.lastUpdated"
          :dataSource="conversionData?.dataSource"
        />
        
        <ConversionForm
          v-model:fromProgram="fromProgram"
          v-model:toProgram="toProgram"
          v-model:amount="amount"
          :programs="conversionData?.programs"
          :conversions="conversionData?.conversions"
          @convert="handleConvert"
        />
        
        <TransferPreview
          v-if="showPreview"
          :fromProgram="fromProgram"
          :toProgram="toProgram"
          :programs="conversionData?.programs"
          :conversions="conversionData?.conversions"
        />
        
        <ConversionResults
          v-if="showResults"
          :results="conversionResults"
        />
        
        <AdPlaceholder />
        
        <AffiliateLinks
          :links="conversionData?.affiliateLinks"
        />
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import DataInfo from './components/DataInfo.vue'
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
const conversionResults = ref(null)

// Use conversion composable
const { conversionData, loadConversionData, findDirectConversion, findMultiStepConversions } = useConversions()

// Computed properties
const showPreview = computed(() => {
  return (fromProgram.value && !toProgram.value) || (!fromProgram.value && toProgram.value)
})

const showResults = computed(() => {
  return conversionResults.value !== null
})

// Methods
const handleConvert = () => {
  if (!amount.value || !fromProgram.value || !toProgram.value) {
    alert('Please fill in all fields')
    return
  }
  
  if (fromProgram.value === toProgram.value) {
    alert('Please select different programs')
    return
  }
  
  const directConversion = findDirectConversion(fromProgram.value, toProgram.value)
  const multiStepRoutes = findMultiStepConversions(fromProgram.value, toProgram.value)
  
  conversionResults.value = {
    amount: amount.value,
    fromProgram: fromProgram.value,
    toProgram: toProgram.value,
    directConversion,
    multiStepRoutes,
    programs: conversionData.value.programs
  }
}

// Lifecycle
onMounted(() => {
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