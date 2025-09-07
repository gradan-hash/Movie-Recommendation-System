<template>
  <div class="animate-pulse">
    <!-- Movie Card Skeleton -->
    <div v-if="type === 'movie-card'" class="space-y-3">
      <div class="aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl relative overflow-hidden">
        <!-- Shimmer Effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
      </div>
      <div class="space-y-2 px-1">
        <div class="h-4 bg-gray-800 rounded-md w-3/4"></div>
        <div class="h-3 bg-gray-800 rounded-md w-1/2"></div>
      </div>
    </div>

    <!-- Movie Grid Skeleton -->
    <div v-else-if="type === 'movie-grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      <div v-for="i in count" :key="i" class="space-y-3" :style="{ animationDelay: `${i * 100}ms` }">
        <div class="aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer"></div>
        </div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-800 rounded-md"></div>
          <div class="h-3 bg-gray-800 rounded-md w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- Hero Section Skeleton -->
    <div v-else-if="type === 'hero'" class="space-y-8">
      <div class="text-center space-y-6">
        <div class="h-16 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl w-96 mx-auto relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
        </div>
        <div class="space-y-3 max-w-2xl mx-auto">
          <div class="h-6 bg-gray-800 rounded-lg"></div>
          <div class="h-6 bg-gray-800 rounded-lg w-4/5 mx-auto"></div>
        </div>
        <div class="h-14 bg-gray-800 rounded-xl w-96 mx-auto relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
        </div>
      </div>
    </div>

    <!-- Search Results Skeleton -->
    <div v-else-if="type === 'search-results'" class="space-y-6">
      <div class="flex items-center justify-between mb-8">
        <div class="space-y-2">
          <div class="h-8 bg-gray-800 rounded-lg w-64"></div>
          <div class="h-5 bg-gray-800 rounded-md w-32"></div>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div v-for="i in count || 12" :key="i" class="space-y-3">
          <div class="aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent shimmer"></div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-800 rounded-md"></div>
            <div class="h-3 bg-gray-800 rounded-md w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Player Skeleton -->
    <div v-else-if="type === 'video-player'" class="space-y-4">
      <div class="aspect-video bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer"></div>
        <div class="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
          <div class="w-6 h-6 bg-gray-500 rounded-full"></div>
        </div>
      </div>
      <div class="bg-gray-800 rounded-xl p-4 space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-5 bg-gray-700 rounded-full w-16"></div>
          <div class="flex-1 h-2 bg-gray-700 rounded-full"></div>
          <div class="h-5 bg-gray-700 rounded-full w-16"></div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div class="w-10 h-10 bg-gray-700 rounded-lg"></div>
            <div class="w-20 h-6 bg-gray-700 rounded-md"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-gray-700 rounded-lg"></div>
            <div class="w-10 h-10 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Lines Skeleton -->
    <div v-else-if="type === 'text'" class="space-y-3">
      <div v-for="i in (count || 3)" :key="i" 
           class="h-4 bg-gray-800 rounded-md"
           :class="i === count ? 'w-2/3' : 'w-full'">
      </div>
    </div>

    <!-- Generic Box Skeleton -->
    <div v-else class="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl relative overflow-hidden"
         :class="customClass || 'h-32'">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'movie-card' | 'movie-grid' | 'hero' | 'search-results' | 'video-player' | 'text' | 'box'
  count?: number
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'box',
  count: 6
})
</script>

<style scoped>
/* Shimmer Animation */
.shimmer {
  animation: shimmer 2s infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Pulse with stagger */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}

/* Premium gradient animations */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
}
</style>