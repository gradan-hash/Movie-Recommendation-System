<template>
  <!-- Global Loader Overlay -->
  <transition name="loader-fade">
    <div 
      v-if="loader.isLoading.value" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
    >
      <div class="bg-gray-900 rounded-2xl p-8 max-w-sm mx-4 border border-gray-700 shadow-2xl">
        
        <!-- Loading Animation -->
        <div class="flex flex-col items-center">
          
          <!-- Custom Cinema Spinner -->
          <div class="relative w-16 h-16 mb-6">
            <!-- Outer ring -->
            <div class="absolute inset-0 rounded-full border-4 border-gray-600"></div>
            <!-- Animated ring -->
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-500 animate-spin"></div>
            <!-- Inner film reel -->
            <div class="absolute inset-2 rounded-full bg-gray-800 flex items-center justify-center">
              <div class="w-6 h-6 rounded-full bg-red-500 animate-pulse"></div>
            </div>
          </div>

          <!-- Loading Text -->
          <h3 class="text-white text-lg font-semibold mb-2">
            {{ loader.currentOperation.value?.label || 'Loading...' }}
          </h3>

          <!-- Progress Indicator -->
          <div class="text-gray-400 text-sm mb-4">
            {{ formatDuration(currentDuration) }}
            <span v-if="loader.operationCount.value > 1" class="ml-2 text-yellow-400">
              ({{ loader.operationCount.value }} operations)
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-red-500 to-purple-500 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>

          <!-- Loading Tips -->
          <div class="mt-4 text-gray-400 text-xs text-center">
            <p class="animate-pulse">{{ currentTip }}</p>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { globalLoader } from '@/services/loader'

// State
const loader = globalLoader
const currentDuration = ref(0)
const timer = ref<number | null>(null)

// Loading tips for user engagement
const loadingTips = [
  '🎬 Fetching the best movies for you...',
  '🍿 Preparing your cinema experience...',
  '🎭 Loading movie magic...',
  '🎥 Getting ready to roll...',
  '⭐ Curating amazing content...',
  '🎪 Setting up the show...'
]

// Computed
const currentTip = computed(() => {
  const index = Math.floor(currentDuration.value / 2000) % loadingTips.length
  return loadingTips[index]
})

const progressPercentage = computed(() => {
  // Simulate progress based on duration (0-100%)
  const maxDuration = 10000 // 10 seconds
  const percentage = Math.min((currentDuration.value / maxDuration) * 100, 95)
  return percentage
})

// Methods
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const updateDuration = () => {
  if (loader.currentOperation.value) {
    const startTime = loader.currentOperation.value.startTime
    currentDuration.value = Date.now() - startTime
  } else {
    currentDuration.value = 0
  }
}

// Lifecycle
onMounted(() => {
  timer.value = window.setInterval(updateDuration, 100)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
/* Loader transitions */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: all 0.3s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Custom animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-spin {
  animation: spin 1.5s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>