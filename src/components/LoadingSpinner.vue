<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="flex flex-col items-center gap-4">
      <!-- Spinner -->
      <div 
        :class="spinnerClass"
        class="border-4 border-gray-600 border-t-red-600 rounded-full animate-spin"
      ></div>
      
      <!-- Loading text -->
      <div v-if="showText" class="text-center">
        <p class="text-white font-semibold">{{ text }}</p>
        <p v-if="subtext" class="text-gray-400 text-sm mt-1">{{ subtext }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  size?: 'small' | 'medium' | 'large'
  text?: string
  subtext?: string
  showText?: boolean
  fullPage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  text: 'Loading...',
  subtext: '',
  showText: true,
  fullPage: false
})

// Computed classes
const spinnerClass = computed(() => {
  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }
  return sizes[props.size]
})

const containerClass = computed(() => {
  if (props.fullPage) {
    return 'min-h-screen py-20'
  }
  return 'py-12'
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>