<template>
  <div class="movie-grid">
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div 
        v-for="n in 10" 
        :key="n" 
        class="animate-pulse bg-gray-800 rounded-lg aspect-[2/3]"
      >
        <div class="bg-gray-700 h-full rounded-lg"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-400 text-6xl mb-4">⚠️</div>
      <h3 class="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
      <p class="text-gray-400 mb-4">{{ error }}</p>
      <button 
        @click="$emit('retry')"
        class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!movies.length" class="text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">🎬</div>
      <h3 class="text-xl font-bold text-white mb-2">No movies found</h3>
      <p class="text-gray-400">{{ emptyMessage }}</p>
    </div>

    <!-- Movies Grid -->
    <div v-else>
      <!-- Section Title -->
      <h2 v-if="title" class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span v-if="icon">{{ icon }}</span>
        {{ title }}
        <span v-if="movies.length" class="text-gray-400 text-lg font-normal">
          ({{ movies.length }} movies)
        </span>
      </h2>

      <!-- Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <MovieCard
          v-for="movie in movies"
          :key="movie.id"
          :movie="movie"
          :is-liked="isMovieLiked(movie.id)"
          @click="$emit('movie-click', movie)"
          @view-details="$emit('view-details', movie)"
          @toggle-like="$emit('toggle-like', movie)"
          @watch="$emit('watch-movie', movie)"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="showLoadMore" class="text-center mt-8">
        <button
          @click="$emit('load-more')"
          :disabled="loadingMore"
          class="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loadingMore" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </span>
          <span v-else>Load More Movies</span>
        </button>
      </div>
    </div>

    <!-- Movies Count -->
    <div v-if="movies.length" class="mt-6 text-center text-gray-400 text-sm">
      {{ movies.length }} of {{ totalResults || movies.length }} movies
    </div>
  </div>
</template>

<script setup lang="ts">
import MovieCard from './MovieCard.vue'
import type { Movie } from '@/types/movie'

// Props
interface Props {
  movies: Movie[]
  loading?: boolean
  loadingMore?: boolean
  error?: string | null
  title?: string
  icon?: string
  emptyMessage?: string
  showLoadMore?: boolean
  totalResults?: number
  likedMovieIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMore: false,
  error: null,
  title: '',
  icon: '',
  emptyMessage: 'Try adjusting your search criteria.',
  showLoadMore: false,
  totalResults: 0,
  likedMovieIds: () => []
})

// Emits
defineEmits<{
  'movie-click': [movie: Movie]
  'view-details': [movie: Movie]
  'toggle-like': [movie: Movie]
  'watch-movie': [movie: Movie]
  'load-more': []
  'retry': []
}>()

// Helper function to check if movie is liked
const isMovieLiked = (movieId: number): boolean => {
  return props.likedMovieIds.includes(movieId)
}
</script>

<style scoped>
.movie-grid {
  @apply min-h-[400px];
}

/* Custom responsive grid for better mobile experience */
@media (max-width: 640px) {
  .movie-grid .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Smooth scroll behavior for load more */
.movie-grid {
  scroll-behavior: smooth;
}
</style>