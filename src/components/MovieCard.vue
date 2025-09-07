<template>
  <div 
    class="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
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
      
      <!-- Gradient overlay on hover -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <!-- Rating badge -->
      <div class="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
        <span class="text-yellow-400 text-sm">⭐</span>
        <span class="text-white text-sm font-semibold">{{ formattedRating }}</span>
      </div>

      <!-- Like button -->
      <button
        @click.stop="toggleLike"
        class="absolute top-2 right-2 w-8 h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/90 hover:scale-110"
        :class="{ 'text-red-500': isLiked, 'text-white hover:text-red-400': !isLiked }"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>

    <!-- Movie Info -->
    <div class="p-4">
      <h3 class="text-white font-bold text-lg mb-2 line-clamp-2 leading-tight">
        {{ movie.title }}
      </h3>
      
      <p class="text-gray-300 text-sm mb-3 line-clamp-3 leading-relaxed">
        {{ movie.overview || 'No description available.' }}
      </p>
      
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-400">{{ releaseYear }}</span>
        <span class="text-gray-400">{{ movie.vote_count }} votes</span>
      </div>
    </div>

    <!-- Hover overlay with action buttons -->
    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
      <div class="flex flex-col gap-3">
        <!-- Watch Button (Primary) -->
        <button 
          @click.stop="emit('watch', movie)"
          class="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
          </svg>
          Watch Now
        </button>
        
        <!-- Secondary Actions -->
        <div class="flex gap-2">
          <button 
            @click.stop="emit('view-details', movie)"
            class="bg-gray-700 text-white px-3 py-2 rounded-full text-sm font-semibold hover:bg-gray-600 transition-colors duration-200"
          >
            Details
          </button>
          <button 
            @click.stop="toggleLike"
            class="bg-gray-700 text-white px-3 py-2 rounded-full text-sm font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center gap-1"
          >
            {{ isLiked ? '❤️' : '🤍' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

// Reactive state
const imageError = ref(false)

// Computed properties
const posterUrl = computed(() => {
  if (imageError.value || !props.movie.poster_path) {
    return 'https://via.placeholder.com/300x450/374151/9CA3AF?text=No+Image'
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-\[2\/3\] {
  aspect-ratio: 2 / 3;
}
</style>