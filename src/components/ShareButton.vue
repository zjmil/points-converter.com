<template>
  <div v-if="showShareButton" class="share-section">
    <button 
      @click="shareConversion"
      class="share-btn"
      :disabled="!canShare"
    >
      📋 Share This Conversion
    </button>
    <p v-if="shareMessage" class="share-message" :class="{ 'success': shareSuccess }">
      {{ shareMessage }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  fromProgram: String,
  toProgram: String,
  amount: Number,
  programs: Object
})

const shareMessage = ref('')
const shareSuccess = ref(false)

const showShareButton = computed(() => {
  return props.fromProgram && props.toProgram
})

const canShare = computed(() => {
  return props.fromProgram && props.toProgram
})

const shareConversion = async () => {
  if (!canShare.value) return

  const params = new URLSearchParams()
  params.set('from', props.fromProgram)
  params.set('to', props.toProgram)
  if (props.amount !== 1000) {
    params.set('amount', props.amount.toString())
  }

  const shareURL = `${window.location.origin}${window.location.pathname}?${params.toString()}`
  
  try {
    // Try to use the Web Share API if available
    if (navigator.share) {
      const fromName = props.programs?.[props.fromProgram]?.name || props.fromProgram
      const toName = props.programs?.[props.toProgram]?.name || props.toProgram
      
      await navigator.share({
        title: 'Points Converter',
        text: `Convert ${props.amount.toLocaleString()} ${fromName} to ${toName}`,
        url: shareURL
      })
      
      shareMessage.value = 'Shared successfully!'
      shareSuccess.value = true
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(shareURL)
      shareMessage.value = 'Link copied to clipboard!'
      shareSuccess.value = true
    }
  } catch (error) {
    // Final fallback - just show the URL
    shareMessage.value = `Share this URL: ${shareURL}`
    shareSuccess.value = false
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    shareMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.share-section {
  margin-top: 1rem;
  text-align: center;
}

.share-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.share-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.share-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.share-message {
  margin-top: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.share-message.success {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}
</style>