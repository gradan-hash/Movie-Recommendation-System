<template>
  <div class="home-view font-base">
    <!-- Hero Section - Mobile First -->
    <section
      class="relative min-h-[40vh] md:min-h-[40vh] flex items-center justify-center overflow-hidden"
    >
      <!-- Animated Background Elements - Smaller on mobile -->
      <div class="absolute inset-0 opacity-20 md:opacity-30">
        <div
          class="absolute top-10 left-5 md:top-20 md:left-10 w-32 h-32 md:w-72 md:h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute bottom-10 right-5 md:bottom-20 md:right-10 w-48 h-48 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style="animation-delay: 1s"
        ></div>
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style="animation-delay: 2s"
        ></div>
      </div>

      <!-- Hero Content - Mobile First -->
      <div class="relative z-10 text-center px-4 w-full max-w-6xl mx-auto">
        <!-- Main Heading - Mobile First -->
        <div class="mb-6 md:mb-8">
          <h1
            class="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black bg-gradient-to-r from-white via-red-200 to-purple-200 bg-clip-text text-transparent mb-3 md:mb-4 animate-fade-in"
          >
            CinemaAI
          </h1>
          <p
            class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-2"
          >
            Discover your next favorite movie with
            <span class="text-red-400 font-semibold">AI-powered recommendations</span> and explore
            thousands of films from around the world
          </p>
        </div>

        <!-- Search Bar - Mobile Optimized -->
        <div class="mb-8 md:mb-14">
          <SearchBar
            :is-searching="moviesStore.loading"
            :total-results="moviesStore.totalResults"
            @search="onSearch"
            @clear="onSearchClear"
            @quick-search="onQuickSearch"
          />
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gray-900/50"></div>

      <div class="relative container mx-auto px-4">
        <!-- Liked Movies Section - Mobile First -->

        <!-- Content Categories Section - Mobile First -->
        <section class="relative">
          <!-- Category Tabs - Mobile Optimized -->
          <div class="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
            <!-- Tab Navigation - Full Width on Mobile -->
            <div class="flex items-center justify-center px-2">
              <div
                class="bg-gray-800/80 backdrop-blur-lg rounded-xl md:rounded-2xl p-1 md:p-2 border border-gray-700/50 w-full max-w-md"
              >
                <div class="flex gap-1 md:gap-2">
                  <button
                    @click="setActiveCategory('movie')"
                    class="relative flex-1 px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base"
                    :class="
                      activeCategory === 'movie'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    "
                  >
                    <span class="relative z-10 flex items-center justify-center gap-1 md:gap-2">
                      <span class="text-sm md:text-base">🎬</span>
                      <span>Movies</span>
                      <span
                        v-if="moviesStore.totalResults && activeCategory === 'movie'"
                        class="text-xs bg-white/20 px-1 md:px-2 py-0.5 md:py-1 rounded-full hidden sm:inline"
                      >
                        {{ formatNumber(moviesStore.totalResults) }}
                      </span>
                    </span>
                  </button>
                  <button
                    @click="setActiveCategory('tv')"
                    class="relative flex-1 px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base"
                    :class="
                      activeCategory === 'tv'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    "
                  >
                    <span class="relative z-10 flex items-center justify-center gap-1 md:gap-2">
                      <span class="text-sm md:text-base">📺</span>
                      <span>TV Series</span>
                      <span
                        v-if="tvStore.totalResults && activeCategory === 'tv'"
                        class="text-xs bg-white/20 px-1 md:px-2 py-0.5 md:py-1 rounded-full hidden sm:inline"
                      >
                        {{ formatNumber(tvStore.totalResults) }}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Section Title - Mobile Centered -->
            <div class="text-center px-4">
              <h2
                class="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2 md:gap-3 mb-2"
              >
                <div
                  class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl"
                  :class="
                    activeCategory === 'movie'
                      ? 'from-red-500 to-red-600'
                      : 'from-purple-500 to-purple-600'
                  "
                >
                  {{ currentSectionIcon }}
                </div>
                <span class="text-xl md:text-3xl">{{ currentSectionTitle }}</span>
              </h2>
              <p class="text-gray-400 text-sm md:text-lg" v-if="currentTotalResults">
                {{ currentTotalResults.toLocaleString() }}
                {{ activeCategory === 'movie' ? 'movies' : 'series' }} found
              </p>
            </div>
          </div>

          <!-- Content Grid -->
          <MovieGrid
            :movies="currentContent"
            :loading="currentLoading"
            :loading-more="currentLoadingMore"
            :error="currentError"
            :show-load-more="false"
            :use-pagination="true"
            :current-page="currentPage"
            :total-pages="currentTotalPages"
            :total-results="currentTotalResults"
            :liked-movie-ids="userStore.likedMovieIds"
            @movie-click="viewMovieDetails"
            @view-details="viewMovieDetails"
            @toggle-like="handleMovieLike"
            @watch-movie="handleWatchMovie"
            @page-change="handlePageChange"
            @retry="retryCurrentAction"
          />
        </section>
      </div>
    </div>

    <!-- No modal needed - navigate directly to watch page -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import type { Movie, MediaType } from '@/types/movie'

import SearchBar from '@/components/SearchBar.vue'
import MovieGrid from '@/components/MovieGrid.vue'
import { useMoviesStore, useUserStore, useTVStore } from '@/stores'
import { tmdbService } from '@/services/tmdb'
import { AIRecommendationService, type AIRecommendation } from '@/services/ai-recommendations'

// Router
const router = useRouter()
const route = useRoute()

// Stores
const moviesStore = useMoviesStore()
const userStore = useUserStore()
const tvStore = useTVStore()

// State
const currentAction = ref<string>('')
const hoveringMovie = ref<Movie | null>(null)
const hoverTimer = ref<number | null>(null)
const activeCategory = ref<MediaType>('movie')

// AI Recommendations State
const aiRecommendations = ref<AIRecommendation[]>([])
const aiLoading = ref(false)

// Computed (welcome section removed - now using hero section)

const currentSectionTitle = computed(() => {
  const isSearching =
    activeCategory.value === 'movie' ? moviesStore.isSearching : tvStore.isSearching
  const searchQuery =
    activeCategory.value === 'movie' ? moviesStore.searchQuery : tvStore.searchQuery

  if (isSearching) {
    return `Search Results for "${searchQuery}"`
  }

  return activeCategory.value === 'movie' ? 'Popular Movies' : 'Popular TV Series'
})

const currentSectionIcon = computed(() => {
  const isSearching =
    activeCategory.value === 'movie' ? moviesStore.isSearching : tvStore.isSearching

  if (isSearching) return '🔍'
  return activeCategory.value === 'movie' ? '🎬' : '📺'
})

const currentTotalResults = computed(() => {
  return activeCategory.value === 'movie' ? moviesStore.totalResults : tvStore.totalResults
})

const currentLoading = computed(() => {
  return activeCategory.value === 'movie' ? moviesStore.loading : tvStore.loading
})

const currentLoadingMore = computed(() => {
  return activeCategory.value === 'movie' ? moviesStore.loadingMore : tvStore.loadingMore
})

const currentError = computed(() => {
  return activeCategory.value === 'movie' ? moviesStore.error : tvStore.error
})

const currentPage = computed(() => {
  return activeCategory.value === 'movie' ? moviesStore.currentPage : tvStore.currentPage
})

const currentTotalPages = computed(() => {
  return activeCategory.value === 'movie' ? moviesStore.totalPages : tvStore.totalPages
})

const currentContent = computed(() => {
  if (activeCategory.value === 'movie') {
    return moviesStore.getCurrentMovies
  } else {
    // Map TVSeries[] to Movie[]-like objects for MovieGrid
    return tvStore.getCurrentSeries.map((series: any) => ({
      ...series,
      title: series.name,
      release_date: series.first_air_date,
      original_title: series.original_name || series.name,
      video: false, // TV series don't have this, set to false or handle as needed
    }))
  }
})

// Methods
const setActiveCategory = async (category: MediaType) => {
  if (activeCategory.value === category) return

  activeCategory.value = category

  if (category === 'movie') {
    if (!moviesStore.hasPopularMovies) {
      await loadPopularMovies()
    }
  } else {
    if (!tvStore.hasPopularSeries) {
      await loadPopularTVSeries()
    }
  }
}

const loadPopularMovies = async () => {
  currentAction.value = 'popular'
  await moviesStore.loadPopularMovies()
}

const loadPopularTVSeries = async () => {
  currentAction.value = 'popular'
  await tvStore.loadPopularTVSeries()
}

const onSearch = async (query: string) => {
  currentAction.value = 'search'

  if (activeCategory.value === 'movie') {
    await moviesStore.searchMovies(query)
  } else {
    await tvStore.searchTVSeries(query)
  }
}

const onSearchClear = async () => {
  if (activeCategory.value === 'movie') {
    moviesStore.clearSearchResults()
    if (!moviesStore.hasPopularMovies) {
      await loadPopularMovies()
    }
  } else {
    tvStore.clearSearchResults()
    if (!tvStore.hasPopularSeries) {
      await loadPopularTVSeries()
    }
  }
}

const onQuickSearch = async (filter: string) => {
  const filterMap: Record<string, string> = {
    'Popular Now': 'popular',
    'Top Rated': 'best movies',
    'Recent Releases': '2024',
    'Classic Movies': 'classic',
  }

  const query = filterMap[filter] || filter
  await onSearch(query)
}

const viewMovieDetails = (movie: Movie) => {
  // Navigate directly to watch page instead of modal
  router.push(`/watch/movie/${movie.id}`)
}

const loadAIRecommendations = async () => {
  if (!userStore.canGetRecommendations || aiLoading.value) return

  aiLoading.value = true

  try {
    const response = await AIRecommendationService.generateRecommendations(userStore.likedMovies)

    if (response.success || response.recommendations.length > 0) {
      aiRecommendations.value = response.recommendations
    } else {
    }
  } catch (err: any) {
    console.warn('❌ HomeView: Failed to load AI recommendations:', err)
  } finally {
    aiLoading.value = false
  }
}

const retryCurrentAction = async () => {
  if (activeCategory.value === 'movie') {
    if (currentAction.value === 'search') {
      await moviesStore.searchMovies(moviesStore.searchQuery)
    } else {
      await loadPopularMovies()
    }
  } else {
    if (currentAction.value === 'search') {
      await tvStore.searchTVSeries(tvStore.searchQuery)
    } else {
      await loadPopularTVSeries()
    }
  }
}

const handlePageChange = async (page: number) => {
  if (activeCategory.value === 'movie') {
    if (moviesStore.isSearching) {
      await moviesStore.searchMovies(moviesStore.searchQuery, page)
    } else {
      await moviesStore.loadPopularMovies(page)
    }
  } else {
    if (tvStore.isSearching) {
      await tvStore.searchTVSeries(tvStore.searchQuery, page)
    } else {
      await tvStore.loadPopularTVSeries(page)
    }
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Netflix-like interaction: prompt for auth when liking movies
const handleMovieLike = (movie: Movie) => {
  if (!userStore.isAuthenticated) {
    // Show login modal when authentication is required
    userStore.openAuthModal('login')
    return
  }

  // User is authenticated, proceed with like/unlike
  userStore.toggleLike(movie)
}

// Initialize
onMounted(async () => {
  await loadPopularMovies()

  // Load AI recommendations if user qualifies - but only if not already loading
  if (userStore.canGetRecommendations && !aiLoading.value && aiRecommendations.value.length === 0) {
    // Delay AI recommendations to avoid overwhelming the API on page load
    setTimeout(() => {
      if (userStore.canGetRecommendations && !aiLoading.value) {
        loadAIRecommendations()
      }
    }, 2000) // Wait 2 seconds after page load
  }

  // Check if user was redirected here because auth was required
  if (route && route.query && route.query.auth === 'required') {
    // Show login modal immediately when auth is required
    showAuthRequired(route.query.redirect as string)
  }
})

// Show authentication modal when required
const showAuthRequired = (redirectPath?: string) => {
  // Show login modal immediately when auth is required
  userStore.openAuthModal('login')

  if (redirectPath) {
  }
}

// Handle watch movie - Netflix-like experience
const handleWatchMovie = async (movie: Movie) => {
  // Check if auth is still loading
  if (userStore.authLoading) {
    return
  }

  // Double-check auth state to avoid race conditions
  if (!userStore.isAuthenticated) {
    userStore.openAuthModal('login')
    return
  }

  // User is authenticated, redirect to watch page
  router.push(`/watch/movie/${movie.id}`)
}

// Hover preview functionality for favorites

const stopHoverPreview = (movie: Movie) => {
  // Clear timer if user stops hovering before preview starts
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
    hoverTimer.value = null
  }

  // Stop preview if it's currently showing
  if (hoveringMovie.value?.id === movie.id) {
    hoveringMovie.value = null
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* Custom Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.6);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Smooth hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Glass morphism effect */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

/* Custom gradient text */
.bg-gradient-to-r.from-white.via-red-200.to-purple-200.bg-clip-text.text-transparent {
  background: linear-gradient(135deg, #ffffff 0%, #fecaca 50%, #ddd6fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ef4444, #8b5cf6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #dc2626, #7c3aed);
}

/* Improved line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Cinema-style background pattern */
.home-view::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Enhanced button hover effects */
.hover\:shadow-red-500\/25:hover {
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.25);
}

.hover\:shadow-purple-500\/25:hover {
  box-shadow: 0 10px 25px rgba(147, 51, 234, 0.25);
}
</style>
