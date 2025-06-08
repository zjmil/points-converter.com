<template>
  <div class="dollar-value-toggle">
    <label class="toggle-label">
      <input 
        type="checkbox" 
        :checked="modelValue"
        @change="$emit('update:modelValue', $event.target.checked)"
        class="toggle-input"
      >
      <span class="toggle-switch"></span>
      <span class="toggle-text">Show dollar values</span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: Boolean
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.dollar-value-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  user-select: none;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #ddd;
  border-radius: 12px;
  margin-right: 0.75rem;
  transition: background-color 0.3s ease;
}

.toggle-switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-input:checked + .toggle-switch {
  background-color: #3498db;
}

.toggle-input:checked + .toggle-switch::before {
  transform: translateX(20px);
}

.toggle-text {
  font-weight: 500;
}

.toggle-label:hover .toggle-switch {
  background-color: #bbb;
}

.toggle-input:checked + .toggle-switch:hover {
  background-color: #2980b9;
}
</style>