<template>
  <div class="virtual-movie-grid" ref="containerRef">
    <!-- Loading State -->
    <div v-if="loading">
      <SkeletonLoader type="movie-grid" :count="12" />
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

    <!-- Virtual Grid -->
    <div v-else class="virtual-grid-wrapper">
      <!-- Section Title -->
      <h2 v-if="title" class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span v-if="icon">{{ icon }}</span>
        {{ title }}
        <span v-if="movies.length" class="text-gray-400 text-lg font-normal">
          ({{ movies.length }} movies)
        </span>
      </h2>

      <!-- Virtual Scrolling Container -->
      <div
        class="virtual-scroll-container"
        :style="{ height: containerHeight + 'px' }"
        @scroll="handleScroll"
        ref="scrollContainer"
      >
        <!-- Virtual Grid Content -->
        <div
          class="virtual-grid-content"
          :style="{
            height: totalHeight + 'px',
            paddingTop: offsetY + 'px',
          }"
        >
          <!-- Rendered Movie Cards -->
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6"
          >
            <MovieCard
              v-for="movie in visibleMovies"
              :key="movie.id"
              :movie="movie"
              :is-liked="isMovieLiked(movie.id)"
              :use-lazy-loading="true"
              @click="$emit('movie-click', movie)"
              @view-details="$emit('view-details', movie)"
              @toggle-like="$emit('toggle-like', movie)"
              @watch="$emit('watch-movie', movie)"
            />
          </div>
        </div>
      </div>

      <!-- Load More Trigger -->
      <div
        v-if="showLoadMore && !loadingMore"
        ref="loadMoreTrigger"
        class="load-more-trigger h-4"
      ></div>

      <!-- Loading More Indicator -->
      <div v-if="loadingMore" class="text-center mt-6 px-4">
        <div class="flex items-center justify-center gap-2 text-gray-400">
          <div
            class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
          ></div>
          <span>Loading more movies...</span>
        </div>
      </div>

      <!-- Movies Count -->
      <div v-if="movies.length && !usePagination" class="mt-6 text-center text-gray-400 text-sm">
        Showing {{ visibleMovies.length }} of {{ movies.length }} movies
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import MovieCard from './MovieCard.vue'
import SkeletonLoader from './SkeletonLoader.vue'
import type { Movie } from '@/types/movie'
import { usePerformance } from '@/composables/usePerformance'

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
  usePagination?: boolean
  itemHeight?: number
  containerHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMore: false,
  error: null,
  emptyMessage: 'Try adjusting your search or filters',
  showLoadMore: false,
  usePagination: false,
  itemHeight: 400, // Approximate height of movie card + gap
  containerHeight: 800, // Default container height
})

// Emits
const emit = defineEmits<{
  'movie-click': [movie: Movie]
  'view-details': [movie: Movie]
  'toggle-like': [movie: Movie]
  'watch-movie': [movie: Movie]
  'load-more': []
  retry: []
}>()

// Performance composable
const { throttle, debounce } = usePerformance()

// Template refs
const containerRef = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()
const loadMoreTrigger = ref<HTMLElement>()

// Virtual scrolling state
const scrollTop = ref(0)
const visibleRange = ref({ start: 0, end: 12 })
const columnsPerRow = ref(6)
const rowsVisible = ref(3)
const bufferRows = ref(1)

// Intersection Observer for load more
let loadMoreObserver: IntersectionObserver | null = null

// Computed properties
const rowHeight = computed(() => props.itemHeight)
const totalRows = computed(() => Math.ceil(props.movies.length / columnsPerRow.value))
const totalHeight = computed(() => totalRows.value * rowHeight.value)

const visibleMovies = computed(() => {
  const start = visibleRange.value.start * columnsPerRow.value
  const end = Math.min(visibleRange.value.end * columnsPerRow.value, props.movies.length)
  return props.movies.slice(start, end)
})

const offsetY = computed(() => visibleRange.value.start * rowHeight.value)

// Methods
const updateColumnsPerRow = () => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  if (width >= 1280)
    columnsPerRow.value = 6 // xl
  else if (width >= 1024)
    columnsPerRow.value = 5 // lg
  else if (width >= 768)
    columnsPerRow.value = 4 // md
  else if (width >= 640)
    columnsPerRow.value = 3 // sm
  else columnsPerRow.value = 2 // base

  // Update visible rows based on container height
  rowsVisible.value = Math.ceil(props.containerHeight / rowHeight.value)
}

const updateVisibleRange = () => {
  const scrollY = scrollTop.value
  const startRow = Math.max(0, Math.floor(scrollY / rowHeight.value) - bufferRows.value)
  const endRow = Math.min(totalRows.value, startRow + rowsVisible.value + bufferRows.value * 2)

  visibleRange.value = { start: startRow, end: endRow }
}

const handleScroll = throttle((event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  updateVisibleRange()
}, 16) // ~60fps

const isMovieLiked = (_movieId: number): boolean => {
  // This should be injected or passed as prop in real implementation
  return false
}

// Resize observer
let resizeObserver: ResizeObserver | null = null

const setupResizeObserver = () => {
  if (!window.ResizeObserver || !containerRef.value) return

  resizeObserver = new ResizeObserver(
    debounce(() => {
      updateColumnsPerRow()
      updateVisibleRange()
    }, 100)
  )

  resizeObserver.observe(containerRef.value)
}

// Load more intersection observer
const setupLoadMoreObserver = () => {
  if (!props.showLoadMore || !loadMoreTrigger.value) return

  loadMoreObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !props.loadingMore) {
          emit('load-more')
        }
      })
    },
    {
      rootMargin: '100px',
    }
  )

  loadMoreObserver.observe(loadMoreTrigger.value)
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  updateColumnsPerRow()
  updateVisibleRange()
  setupResizeObserver()
  setupLoadMoreObserver()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (loadMoreObserver) {
    loadMoreObserver.disconnect()
  }
})

// Watch for movies changes
watch(
  () => props.movies.length,
  () => {
    updateVisibleRange()
  }
)

// Watch for load more trigger setup
watch(
  () => props.showLoadMore,
  async showLoadMore => {
    if (showLoadMore) {
      await nextTick()
      setupLoadMoreObserver()
    } else if (loadMoreObserver) {
      loadMoreObserver.disconnect()
      loadMoreObserver = null
    }
  }
)
</script>

<style scoped>
.virtual-movie-grid {
  width: 100%;
}

.virtual-grid-wrapper {
  position: relative;
}

.virtual-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  /* Smooth scrolling */
  scroll-behavior: smooth;
  /* GPU acceleration */
  will-change: scroll-position;
  transform: translateZ(0);
}

.virtual-grid-content {
  position: relative;
  width: 100%;
  /* GPU acceleration for transforms */
  will-change: transform;
  backface-visibility: hidden;
}

.load-more-trigger {
  position: absolute;
  bottom: 200px;
  width: 100%;
  visibility: hidden;
  pointer-events: none;
}

/* Optimize scrollbar */
.virtual-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 3px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.7);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.9);
}

/* Performance optimizations */
.virtual-grid-content > .grid {
  /* Contain layout calculations */
  contain: layout style paint;
  /* GPU acceleration */
  transform: translateZ(0);
  will-change: contents;
}

/* Loading state optimizations */
.virtual-movie-grid .animate-spin {
  /* Optimize spin animation */
  animation: spin 1s linear infinite;
  will-change: transform;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .virtual-scroll-container {
    height: 600px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .virtual-scroll-container {
    scroll-behavior: auto;
  }

  .animate-spin {
    animation: none;
  }
}
</style>
