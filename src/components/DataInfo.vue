<template>
  <div class="data-info">
    <span>{{ lastUpdatedText }}</span>
    <span>{{ dataSourceText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  conversions: Array,
  dataSource: String
})

const lastUpdatedText = computed(() => {
  if (!props.conversions || props.conversions.length === 0) {
    return 'Last updated: Loading...'
  }
  
  // Find the most recent update across all conversions
  const mostRecentUpdate = props.conversions
    .filter(conv => conv.lastUpdated)
    .map(conv => new Date(conv.lastUpdated))
    .reduce((latest, current) => current > latest ? current : latest, new Date(0))
  
  if (mostRecentUpdate.getTime() === 0) {
    return 'Last updated: Unknown'
  }
  
  return `Last updated: ${mostRecentUpdate.toLocaleDateString()}`
})

const dataSourceText = computed(() => {
  return props.dataSource ? `Source: ${props.dataSource}` : 'Source: Loading...'
})
</script>

<style scoped>
.data-info {
  background-color: #e8f4f8;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .data-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>