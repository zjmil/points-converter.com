<template>
  <div class="transfer-preview">
    <h2>{{ title }}</h2>
    <div class="transfer-list">
      <div 
        v-for="transfer in allTransfers" 
        :key="getTransferKey(transfer)"
        class="transfer-item clickable"
        @click="selectTransfer(transfer)"
      >
        <div class="transfer-item-header">
          <div class="transfer-item-title">{{ transfer.title }}</div>
          <div class="transfer-item-rate">1:{{ transfer.rate }}</div>
        </div>
        <div class="transfer-item-details">{{ transfer.details }}</div>
      </div>
      
      <p v-if="allTransfers.length === 0" class="no-transfers">
        No transfers available
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConversions } from '../composables/useConversions'

const props = defineProps({
  fromProgram: String,
  toProgram: String,
  programs: Object,
  conversions: Array
})

const emit = defineEmits(['selectTransfer'])

const { getTransfersFrom, getTransfersTo, conversionData } = useConversions()

const title = computed(() => {
  const programs = conversionData.value?.programs || props.programs
  if (props.fromProgram && !props.toProgram) {
    const programName = programs?.[props.fromProgram]?.name || ''
    return `Transfer ${programName} points to:`
  } else if (!props.fromProgram && props.toProgram) {
    const programName = programs?.[props.toProgram]?.name || ''
    return `Transfer points to ${programName} from:`
  }
  return 'Available Transfers'
})

const allTransfers = computed(() => {
  const programs = conversionData.value?.programs || props.programs
  if (!programs) return []
  
  const transfers = []
  
  if (props.fromProgram && !props.toProgram) {
    // Show transfers FROM the selected program
    const { direct, twoStep } = getTransfersFrom(props.fromProgram)
    
    // Add direct transfers
    direct.forEach(transfer => {
      const targetProgram = programs[transfer.to]?.name || ''
      const rate = transfer.bonus ? transfer.bonusRate : transfer.rate
      
      const details = []
      details.push(`Rate: 1:${rate}`)
      details.push(transfer.instantTransfer ? 'Instant' : '1-2 days')
      
      if (transfer.bonus) {
        details.push('BONUS ACTIVE')
      }
      if (transfer.note) {
        details.push(transfer.note)
      }
      
      transfers.push({
        title: targetProgram,
        rate: rate,
        details: details.join(' • '),
        isDirect: true,
        transferData: transfer
      })
    })
    
    // Add two-step transfers
    twoStep.forEach(transfer => {
      const targetProgram = programs[transfer.to]?.name || ''
      const rate = transfer.totalRate.toFixed(2)
      
      const step1From = programs[transfer.steps[0].from]?.name || ''
      const step1To = programs[transfer.steps[0].to]?.name || ''
      const step2To = programs[transfer.steps[1].to]?.name || ''
      
      const details = []
      details.push(`Rate: 1:${rate} (2 steps)`)
      details.push(`Via: ${step1From} → ${step1To} → ${step2To}`)
      
      transfers.push({
        title: targetProgram,
        rate: rate,
        details: details.join(' • '),
        isDirect: false,
        transferData: transfer
      })
    })
    
  } else if (!props.fromProgram && props.toProgram) {
    // Show transfers TO the selected program
    const { direct, twoStep } = getTransfersTo(props.toProgram)
    
    // Add direct transfers
    direct.forEach(transfer => {
      const sourceProgram = programs[transfer.from]?.name || ''
      const rate = transfer.bonus ? transfer.bonusRate : transfer.rate
      
      const details = []
      details.push(`Rate: 1:${rate}`)
      details.push(transfer.instantTransfer ? 'Instant' : '1-2 days')
      
      if (transfer.bonus) {
        details.push('BONUS ACTIVE')
      }
      if (transfer.note) {
        details.push(transfer.note)
      }
      
      transfers.push({
        title: sourceProgram,
        rate: rate,
        details: details.join(' • '),
        isDirect: true,
        transferData: transfer
      })
    })
    
    // Add two-step transfers
    twoStep.forEach(transfer => {
      const sourceProgram = programs[transfer.from]?.name || ''
      const rate = transfer.totalRate.toFixed(2)
      
      const step1From = programs[transfer.steps[0].from]?.name || ''
      const step1To = programs[transfer.steps[0].to]?.name || ''
      const step2To = programs[transfer.steps[1].to]?.name || ''
      
      const details = []
      details.push(`Rate: 1:${rate} (2 steps)`)
      details.push(`Via: ${step1From} → ${step1To} → ${step2To}`)
      
      transfers.push({
        title: sourceProgram,
        rate: rate,
        details: details.join(' • '),
        isDirect: false,
        transferData: transfer
      })
    })
  }
  
  return transfers
})

const getTransferKey = (transfer) => {
  return `${transfer.title}-${transfer.rate}-${transfer.isDirect}`
}

const selectTransfer = (transfer) => {
  // Determine which program to populate based on current selection
  if (props.fromProgram && !props.toProgram) {
    // From program is selected, populate to program
    const toProgram = transfer.transferData.to || transfer.transferData.steps?.[transfer.transferData.steps.length - 1]?.to
    emit('selectTransfer', { toProgram })
  } else if (!props.fromProgram && props.toProgram) {
    // To program is selected, populate from program  
    const fromProgram = transfer.transferData.from || transfer.transferData.steps?.[0]?.from
    emit('selectTransfer', { fromProgram })
  }
}
</script>

<style scoped>
.transfer-preview {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.transfer-preview h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.transfer-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.transfer-item {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.transfer-item.clickable {
  cursor: pointer;
}

.transfer-item.clickable:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
  border-color: #3498db;
}

.transfer-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.transfer-item-title {
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.transfer-item-rate {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.transfer-item-details {
  font-size: 0.85rem;
  color: #95a5a6;
}

.no-transfers {
  grid-column: 1 / -1;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}
</style>