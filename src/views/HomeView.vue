<template>
  <div class="home-view">
    <!-- Hero Section - Mobile First -->
    <section
      class="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      <!-- Background with Gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-purple-900/20"
      ></div>

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

      <!-- Scroll Down Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          ></path>
        </svg>
      </div>
    </section>

    <!-- Main Content -->
    <div class="relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gray-900/50"></div>

      <div class="relative container mx-auto px-4 py-16">
        <!-- Liked Movies Section - Mobile First -->
        <section v-if="userStore.hasLikedMovies && !moviesStore.isSearching" class="mb-12 md:mb-16">
          <div class="flex flex-col gap-4 mb-6 md:mb-8">
            <div class="text-center md:text-left">
              <h2
                class="text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3 mb-2"
              >
                <div
                  class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl"
                >
                  ❤️
                </div>
                Your Favorites
              </h2>
              <p class="text-gray-400 text-base md:text-lg">
                {{ userStore.likedMoviesCount }} movies in your collection
              </p>
            </div>

            <!-- Action Buttons - Mobile Stack -->
            <div class="flex flex-col sm:flex-row gap-2 md:gap-3">
              <router-link
                to="/favorites"
                class="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-3 md:px-6 rounded-lg md:rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-200 font-medium text-center text-sm md:text-base"
              >
                View All →
              </router-link>
              <button
                v-if="userStore.canGetRecommendations"
                @click="goToRecommendations"
                class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-3 md:px-6 rounded-lg md:rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-purple-500/25 text-sm md:text-base"
              >
                🤖 Get AI Recommendations
              </button>
            </div>
          </div>

          <div class="relative">
            <!-- Mobile: 2 cols, SM: 3 cols, MD: 4 cols, LG: 6 cols, XL: 8 cols -->
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-6"
            >
              <div
                v-for="(movie, index) in userStore.likedMovies.slice(0, 8)"
                :key="movie.id"
                class="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                :style="{ animationDelay: `${index * 100}ms` }"
                @click="viewMovieDetails(movie)"
                @mouseenter="startHoverPreview(movie)"
                @mouseleave="stopHoverPreview(movie)"
              >
                <!-- Movie Poster -->
                <div
                  class="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                >
                  <!-- Main Image -->
                  <img
                    :src="getMoviePoster(movie.poster_path)"
                    :alt="movie.title"
                    class="w-full h-full object-cover transition-opacity duration-300"
                    :class="hoveringMovie?.id === movie.id ? 'opacity-30' : 'opacity-100'"
                  />

                  <!-- Hover Preview Overlay -->
                  <div
                    v-if="hoveringMovie?.id === movie.id"
                    class="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <div class="text-center">
                      <!-- Preview Play Icon -->
                      <div
                        class="w-16 h-16 bg-red-600/80 rounded-full flex items-center justify-center mb-2 mx-auto animate-pulse"
                      >
                        <svg
                          class="w-8 h-8 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"
                          />
                        </svg>
                      </div>
                      <p class="text-white text-xs font-semibold">Preview Playing...</p>
                      <p class="text-gray-300 text-xs">Hover to preview favorites</p>
                    </div>
                  </div>

                  <!-- Gradient Overlay -->
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>

                  <!-- Movie Info Overlay -->
                  <div
                    class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <h3 class="text-white font-bold text-sm mb-1 line-clamp-2">
                      {{ movie.title }}
                    </h3>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 text-yellow-400 text-xs">
                        <span>⭐</span>
                        <span>{{ movie.vote_average.toFixed(1) }}</span>
                      </div>
                      <!-- Watch Button for Favorites -->
                      <button
                        @click.stop="handleWatchMovie(movie)"
                        class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"
                          />
                        </svg>
                        Watch
                      </button>
                    </div>
                  </div>

                  <!-- Love Icon -->
                  <div
                    class="absolute top-3 right-3 w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center"
                  >
                    <span class="text-white text-sm">❤️</span>
                  </div>
                </div>
              </div>

              <!-- Show More Card -->
              <div
                v-if="userStore.likedMoviesCount > 8"
                class="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                @click="$router.push('/favorites')"
              >
                <div
                  class="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-dashed border-gray-600 group-hover:border-red-500"
                >
                  <div class="text-center">
                    <div class="text-3xl font-bold text-red-400 mb-2">
                      +{{ userStore.likedMoviesCount - 8 }}
                    </div>
                    <div class="text-sm text-gray-300 font-medium">More Movies</div>
                    <div class="text-xs text-gray-500 mt-1">View All →</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- AI Recommendations Section - Mobile First -->
        <section
          v-if="userStore.canGetRecommendations && !moviesStore.isSearching"
          class="mb-12 md:mb-16"
        >
          <div class="flex flex-col gap-4 mb-6 md:mb-8">
            <div class="text-center md:text-left">
              <h2
                class="text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3 mb-2"
              >
                <div
                  class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl"
                >
                  🤖
                </div>
                AI Recommendations
              </h2>
              <p class="text-gray-400 text-base md:text-lg">Personalized picks just for you</p>
            </div>

            <!-- Action Buttons - Mobile Stack -->
            <div class="flex flex-col sm:flex-row gap-2 md:gap-3">
              <router-link
                to="/recommendations"
                class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-3 md:px-6 rounded-lg md:rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-200 font-medium text-center text-sm md:text-base shadow-lg shadow-purple-500/25"
              >
                🤖 View All AI Picks →
              </router-link>
            </div>
          </div>

          <!-- AI Recommendations Preview -->
          <div class="relative">
            <!-- Loading State -->
            <div
              v-if="aiLoading"
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-6"
            >
              <div v-for="n in 6" :key="n" class="animate-pulse">
                <div class="aspect-[2/3] bg-gray-800 rounded-2xl"></div>
              </div>
            </div>

            <!-- AI Recommendations Grid -->
            <div
              v-else-if="aiRecommendations.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-6"
            >
              <div
                v-for="(recommendation, index) in aiRecommendations.slice(0, 6)"
                :key="recommendation.movie.id"
                class="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                :style="{ animationDelay: `${index * 100}ms` }"
                @click="handleWatchMovie(recommendation.movie)"
              >
                <!-- AI Badge -->
                <div class="absolute top-2 left-2 z-10">
                  <div
                    class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg"
                  >
                    <span>{{ recommendation.aiGenerated ? '🤖' : '🔗' }}</span>
                    <span class="hidden sm:inline">{{
                      recommendation.aiGenerated ? 'AI' : 'Similar'
                    }}</span>
                  </div>
                </div>

                <!-- Movie Poster -->
                <div
                  class="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    :src="getMoviePoster(recommendation.movie.poster_path)"
                    :alt="recommendation.movie.title"
                    class="w-full h-full object-cover transition-opacity duration-300"
                  />

                  <!-- Gradient Overlay -->
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>

                  <!-- AI Reason Overlay -->
                  <div
                    class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <h3 class="text-white font-bold text-sm mb-1 line-clamp-2">
                      {{ recommendation.movie.title }}
                    </h3>
                    <p class="text-gray-300 text-xs mb-2 line-clamp-2">
                      {{ recommendation.reason }}
                    </p>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 text-yellow-400 text-xs">
                        <span>⭐</span>
                        <span>{{ recommendation.movie.vote_average.toFixed(1) }}</span>
                      </div>
                      <div class="text-purple-300 text-xs font-semibold">
                        {{ recommendation.confidence }}/10
                      </div>
                    </div>
                  </div>

                  <!-- AI Glow Effect -->
                  <div
                    class="absolute inset-0 ring-2 ring-purple-500/0 group-hover:ring-purple-500/50 rounded-2xl transition-all duration-300"
                  ></div>
                </div>
              </div>

              <!-- View More Card -->
              <div
                v-if="aiRecommendations.length > 6"
                class="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                @click="$router.push('/recommendations')"
              >
                <div
                  class="aspect-[2/3] bg-gradient-to-br from-purple-800 to-blue-800 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-dashed border-purple-500 group-hover:border-purple-400"
                >
                  <div class="text-center">
                    <div class="text-3xl font-bold text-purple-300 mb-2">
                      +{{ aiRecommendations.length - 6 }}
                    </div>
                    <div class="text-sm text-purple-200 font-medium">More AI Picks</div>
                    <div class="text-xs text-purple-400 mt-1">View All →</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No AI Recommendations Yet -->
            <div
              v-else
              class="text-center py-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20"
            >
              <div
                class="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span class="text-2xl">🤖</span>
              </div>
              <h3 class="text-lg font-bold text-white mb-2">AI Recommendations Loading...</h3>
              <p class="text-gray-400 text-sm mb-4">
                Our AI is analyzing your taste to find perfect matches
              </p>
              <button
                @click="loadAIRecommendations"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Generate Now
              </button>
            </div>
          </div>
        </section>

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

const goToRecommendations = () => {
  router.push('/recommendations')
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
    console.error('❌ HomeView: Failed to load AI recommendations:', err)
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

const getMoviePoster = (posterPath: string | null): string => {
  return tmdbService.getImageUrl(posterPath, 'w300')
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

  // Load AI recommendations if user qualifies
  if (userStore.canGetRecommendations) {
    loadAIRecommendations()
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
const startHoverPreview = (movie: Movie) => {
  // Clear any existing timer
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
  }

  // Start preview after short delay to avoid accidental triggers
  hoverTimer.value = window.setTimeout(() => {
    hoveringMovie.value = movie
  }, 500)
}

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
