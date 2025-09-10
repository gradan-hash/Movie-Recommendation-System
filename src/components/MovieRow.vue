<template>
  <div class="movie-row mb-6 md:mb-12">
    <!-- Row Title -->
    <div class="flex items-center justify-between mb-4 px-4 md:px-0">
      <h2 class="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
        <font-awesome-icon v-if="icon" :icon="icon" class="text-base md:text-2xl text-red-400" />
        {{ title }}
        <span v-if="totalResults" class="text-gray-400 text-sm md:text-lg font-normal">
          ({{ totalResults }})
        </span>
      </h2>

      <!-- Pagination Controls -->
      <div v-if="showPagination && totalPages > 1" class="flex items-center gap-2">
        <button
          @click="$emit('prev-page')"
          :disabled="currentPage <= 1"
          class="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
        >
          <font-awesome-icon icon="chevron-left" class="text-xs" />
        </button>

        <span class="text-gray-400 text-sm whitespace-nowrap">
          {{ currentPage }}/{{ totalPages }}
        </span>

        <button
          @click="$emit('next-page')"
          :disabled="currentPage >= totalPages"
          class="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
        >
          <font-awesome-icon icon="chevron-right" class="text-xs" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex gap-4 overflow-hidden px-4 md:px-0">
      <div
        v-for="n in 8"
        :key="n"
        class="flex-shrink-0 w-[140px] md:w-[200px] h-[280px] md:h-[300px] bg-gray-800 rounded-lg animate-pulse"
      />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-4 md:px-0">
      <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <div class="text-red-400 text-2xl mb-2">
          <font-awesome-icon icon="exclamation-triangle" />
        </div>
        <p class="text-red-400 font-medium">{{ error }}</p>
        <button
          @click="$emit('retry')"
          class="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!movies.length" class="px-4 md:px-0">
      <div class="bg-gray-800/50 rounded-lg p-8 text-center">
        <div class="text-gray-500 text-3xl mb-3">
          <font-awesome-icon icon="film" />
        </div>
        <p class="text-gray-400">{{ emptyMessage || 'No movies available' }}</p>
      </div>
    </div>

    <!-- Movie Row -->
    <div v-else class="relative group">
      <!-- Scroll Buttons -->
      <button
        v-if="canScrollLeft"
        @click="scrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"
      >
        <font-awesome-icon icon="chevron-left" />
      </button>

      <button
        v-if="canScrollRight"
        @click="scrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 mr-2"
      >
        <font-awesome-icon icon="chevron-right" />
      </button>

      <!-- Scrollable Container -->
      <div
        ref="scrollContainer"
        class="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-4"
        @scroll="updateScrollButtons"
        style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch"
      >
        <div v-for="movie in movies" :key="movie.id" class="flex-shrink-0 w-[140px] md:w-[200px]">
          <MovieCard
            :movie="movie"
            :is-liked="isMovieLiked?.(movie.id) || false"
            @click="$emit('movie-click', movie)"
            @view-details="$emit('view-details', movie)"
            @toggle-like="$emit('toggle-like', movie)"
            @watch="$emit('watch-movie', movie)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import MovieCard from './MovieCard.vue'
import type { Movie } from '@/types/movie'

// Props
interface Props {
  title: string
  icon?: string
  movies: Movie[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  showPagination?: boolean
  currentPage?: number
  totalPages?: number
  totalResults?: number
  isMovieLiked?: (id: number) => boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  emptyMessage: '',
  showPagination: false,
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,
})

// Emits
defineEmits<{
  'movie-click': [movie: Movie]
  'view-details': [movie: Movie]
  'toggle-like': [movie: Movie]
  'watch-movie': [movie: Movie]
  'prev-page': []
  'next-page': []
  retry: []
}>()

// Refs
const scrollContainer = ref<HTMLElement>()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// Methods
const updateScrollButtons = () => {
  const container = scrollContainer.value
  if (!container) return

  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5
}

const scrollLeft = () => {
  const container = scrollContainer.value
  if (!container) return

  const scrollAmount = container.clientWidth * 0.8
  container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })

  setTimeout(updateScrollButtons, 300)
}

const scrollRight = () => {
  const container = scrollContainer.value
  if (!container) return

  const scrollAmount = container.clientWidth * 0.8
  container.scrollBy({ left: scrollAmount, behavior: 'smooth' })

  setTimeout(updateScrollButtons, 300)
}

// Initialize
onMounted(async () => {
  await nextTick()
  updateScrollButtons()

  // Update scroll buttons on window resize
  window.addEventListener('resize', updateScrollButtons)
})
</script>

<style scoped>
/* Hide scrollbar but keep scrolling functionality */
.scrollbar-hide {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

/* Smooth hover effects */
.movie-row:hover .opacity-0 {
  opacity: 1;
}
</style>
