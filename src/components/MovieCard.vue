<template>
  <div 
    class="group relative bg-gray-800 rounded-lg md:rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
    @click="emit('click', movie)"
  >
    <!-- Movie Poster -->
    <div class="relative aspect-[2/3] overflow-hidden">
      <img 
        :src="posterUrl"
        :alt="movie.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        @error="onImageError"
        loading="lazy"
      />
      
      <!-- Gradient overlay - Always visible on mobile, hover on desktop -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <!-- Rating badge - Larger on mobile -->
      <div class="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1">
        <span class="text-yellow-400 text-xs md:text-sm">⭐</span>
        <span class="text-white text-xs md:text-sm font-semibold">{{ formattedRating }}</span>
      </div>

      <!-- Like button - Larger and more touch-friendly on mobile -->
      <button
        @click.stop="toggleLike"
        class="absolute top-2 right-2 w-9 h-9 md:w-10 md:h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/90 active:scale-95"
        :class="{ 'text-red-500': isLiked, 'text-white hover:text-red-400': !isLiked }"
      >
        <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
        </svg>
      </button>

      <!-- Mobile Action Buttons - Always visible on mobile -->
      <div class="absolute bottom-2 left-2 right-2 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <!-- Watch Button (Primary) - Mobile optimized -->
        <button 
          @click.stop="handleWatchClick"
          :disabled="isAuthLoading"
          class="flex-1 bg-red-600 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg font-bold text-sm md:text-base hover:bg-red-700 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!isAuthLoading" class="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
          </svg>
          <svg v-else class="w-4 h-4 md:w-5 md:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="hidden sm:inline">{{ isAuthLoading ? 'Checking...' : 'Watch' }}</span>
        </button>
      </div>
    </div>

    <!-- Movie Info - Reduced padding on mobile -->
    <div class="p-3 md:p-4">
      <h3 class="text-white font-bold text-sm md:text-lg mb-1 md:mb-2 line-clamp-2 leading-tight">
        {{ movie.title }}
      </h3>
      
      <!-- Hide overview on mobile to save space, show on hover/larger screens -->
      <p class="text-gray-300 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 md:line-clamp-3 leading-relaxed hidden sm:block">
        {{ movie.overview || 'No description available.' }}
      </p>
      
      <div class="flex items-center justify-between text-xs md:text-sm">
        <span class="text-gray-400 font-medium">{{ releaseYear }}</span>
        <div class="flex items-center gap-1 text-yellow-400">
          <span>⭐</span>
          <span class="text-white font-semibold">{{ formattedRating }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores'
import { tmdbService } from '@/services/tmdb'
import type { Movie } from '@/types/movie'

// Props
interface Props {
  movie: Movie
  isLiked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLiked: false
})

// Emits
const emit = defineEmits<{
  click: [movie: Movie]
  'view-details': [movie: Movie]
  'toggle-like': [movie: Movie]
  watch: [movie: Movie]
}>()

// Store
const userStore = useUserStore()

// Reactive state
const imageError = ref(false)

// Computed properties
const isAuthLoading = computed(() => userStore.authLoading)
const posterUrl = computed(() => {
  if (imageError.value || !props.movie.poster_path) {
    return 'https://unsplash.com/photos/a-row-of-red-seats-in-a-theater-6dVGbYs-jRw'
  }
  return tmdbService.getImageUrl(props.movie.poster_path, 'w500')
})

const formattedRating = computed(() => {
  return props.movie.vote_average.toFixed(1)
})

const releaseYear = computed(() => {
  return tmdbService.formatReleaseDate(props.movie.release_date)
})

// Methods
const onImageError = () => {
  imageError.value = true
}

const toggleLike = () => {
  // Emit to parent component with authentication requirement
  // Parent will handle the actual like/unlike logic and authentication check
  emit('toggle-like', props.movie)
}

const handleWatchClick = () => {
  // Check if auth is still loading to avoid race conditions
  if (userStore.authLoading) {
    console.log('⏳ Auth still loading, please wait...')
    return
  }
  
  // Emit to parent - parent will handle auth checking and navigation
  emit('watch', props.movie)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-\[2\/3\] {
  aspect-ratio: 2 / 3;
}
</style>