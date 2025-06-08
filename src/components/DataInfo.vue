<template>
  <div class="data-info">
    <span>{{ lastUpdatedText }}</span>
    <span>{{ dataSourceText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lastUpdated: String,
  dataSource: String
})

const lastUpdatedText = computed(() => {
  if (!props.lastUpdated) return 'Last updated: Loading...'
  const date = new Date(props.lastUpdated)
  return `Last updated: ${date.toLocaleDateString()}`
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