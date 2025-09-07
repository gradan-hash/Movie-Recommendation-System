<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <!-- Background with Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-purple-900/20"></div>
      
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <!-- Main Heading -->
        <div class="mb-8">
          <h1 class="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-red-200 to-purple-200 bg-clip-text text-transparent mb-4 animate-fade-in">
            CinemaAI
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover your next favorite movie with <span class="text-red-400 font-semibold">AI-powered recommendations</span> and explore thousands of films from around the world
          </p>
        </div>

        <!-- Search Bar -->
        <div class="mb-12">
          <SearchBar
            :is-searching="moviesStore.loading"
            :total-results="moviesStore.totalResults"
            @search="onSearch"
            @clear="onSearchClear"
            @quick-search="onQuickSearch"
          />
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <div class="text-center">
            <div class="text-3xl font-bold text-red-400 mb-2">500K+</div>
            <div class="text-gray-400 text-sm">Movies</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-400 mb-2">10M+</div>
            <div class="text-gray-400 text-sm">Reviews</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-400 mb-2">AI</div>
            <div class="text-gray-400 text-sm">Powered</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-400 mb-2">Free</div>
            <div class="text-gray-400 text-sm">Forever</div>
          </div>
        </div>
      </div>

      <!-- Scroll Down Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>

    <!-- Main Content -->
    <div class="relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gray-900/50"></div>
      
      <div class="relative container mx-auto px-4 py-16">

      <!-- Liked Movies Section (when user has liked movies) -->
      <section v-if="userStore.hasLikedMovies && !moviesStore.isSearching" class="mb-16">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 class="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                ❤️
              </div>
              Your Favorites
            </h2>
            <p class="text-gray-400 text-lg">{{ userStore.likedMoviesCount }} movies in your collection</p>
          </div>
          <div class="flex gap-3">
            <router-link 
              to="/favorites"
              class="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-200 font-medium"
            >
              View All →
            </router-link>
            <button 
              v-if="userStore.canGetRecommendations"
              @click="goToRecommendations"
              class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg shadow-purple-500/25"
            >
              🤖 Get AI Recommendations
            </button>
          </div>
        </div>
        
        <div class="relative">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
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
              <div class="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
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
                    <div class="w-16 h-16 bg-red-600/80 rounded-full flex items-center justify-center mb-2 mx-auto animate-pulse">
                      <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                      </svg>
                    </div>
                    <p class="text-white text-xs font-semibold">Preview Playing...</p>
                    <p class="text-gray-300 text-xs">Hover to preview favorites</p>
                  </div>
                </div>
                
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Movie Info Overlay -->
                <div class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 class="text-white font-bold text-sm mb-1 line-clamp-2">{{ movie.title }}</h3>
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
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                      </svg>
                      Watch
                    </button>
                  </div>
                </div>
                
                <!-- Love Icon -->
                <div class="absolute top-3 right-3 w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
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
              <div class="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-dashed border-gray-600 group-hover:border-red-500">
                <div class="text-center">
                  <div class="text-3xl font-bold text-red-400 mb-2">+{{ userStore.likedMoviesCount - 8 }}</div>
                  <div class="text-sm text-gray-300 font-medium">More Movies</div>
                  <div class="text-xs text-gray-500 mt-1">View All →</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Movies Section -->
      <section class="relative">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 class="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center text-xl">
                {{ currentSectionIcon }}
              </div>
              {{ currentSectionTitle }}
            </h2>
            <p class="text-gray-400 text-lg" v-if="moviesStore.totalResults">
              {{ moviesStore.totalResults.toLocaleString() }} movies found
            </p>
          </div>
        </div>

        <!-- Movies Grid -->
        <MovieGrid
          :movies="moviesStore.getCurrentMovies"
          :loading="moviesStore.loading"
          :loading-more="moviesStore.loadingMore"
          :error="moviesStore.error"
          :show-load-more="moviesStore.canLoadMore"
          :total-results="moviesStore.totalResults"
          :liked-movie-ids="userStore.likedMovieIds"
          @movie-click="viewMovieDetails"
          @view-details="viewMovieDetails"
          @toggle-like="handleMovieLike"
          @watch-movie="handleWatchMovie"
          @load-more="moviesStore.loadMoreMovies"
          @retry="retryCurrentAction"
        />
      </section>
      </div>
    </div>

    <!-- Movie Details Modal -->
    <div 
      v-if="selectedMovie"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      @click="closeMovieDetails"
    >
      <div 
        class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white">{{ selectedMovie.title }}</h2>
            <button
              @click="closeMovieDetails"
              class="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          <div class="flex gap-6">
            <img
              :src="getMoviePoster(selectedMovie.poster_path)"
              :alt="selectedMovie.title"
              class="w-32 h-48 object-cover rounded-lg"
            />
            
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-4">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-400">⭐</span>
                  <span class="font-semibold">{{ selectedMovie.vote_average.toFixed(1) }}</span>
                </div>
                <span class="text-gray-400">{{ formatYear(selectedMovie.release_date) }}</span>
                <button
                  @click="handleWatchMovie(selectedMovie)"
                  class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                  </svg>
                  Watch Now
                </button>
                <button
                  @click="userStore.toggleLike(selectedMovie)"
                  class="flex items-center gap-1 px-3 py-1 rounded-full transition-colors"
                  :class="userStore.isMovieLiked(selectedMovie.id) ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'"
                >
                  {{ userStore.isMovieLiked(selectedMovie.id) ? '❤️ Liked' : '🤍 Like' }}
                </button>
              </div>
              
              <p class="text-gray-300 leading-relaxed">
                {{ selectedMovie.overview }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'


import type { Movie } from '@/types/movie'

import SearchBar from '@/components/SearchBar.vue'
import MovieGrid from '@/components/MovieGrid.vue'
import { useMoviesStore, useUserStore } from '@/stores'
import { tmdbService } from '@/services/tmdb'

// Router
const router = useRouter()
const route = useRoute()

// Stores
const moviesStore = useMoviesStore()
const userStore = useUserStore()

// State
const selectedMovie = ref<Movie | null>(null)
const currentAction = ref<string>('')
const hoveringMovie = ref<Movie | null>(null)
const hoverTimer = ref<number | null>(null)

// Computed (welcome section removed - now using hero section)

const currentSectionTitle = computed(() => {
  if (moviesStore.isSearching) {
    return `Search Results for "${moviesStore.searchQuery}"`
  }
  return 'Popular Movies'
})

const currentSectionIcon = computed(() => {
  if (moviesStore.isSearching) return '🔍'
  return '🔥'
})

// Methods
const loadPopularMovies = async () => {
  currentAction.value = 'popular'
  await moviesStore.loadPopularMovies()
}

const onSearch = async (query: string) => {
  currentAction.value = 'search'
  await moviesStore.searchMovies(query)
}

const onSearchClear = async () => {
  moviesStore.clearSearchResults()
  if (!moviesStore.hasPopularMovies) {
    await loadPopularMovies()
  }
}

const onQuickSearch = async (filter: string) => {
  const filterMap: Record<string, string> = {
    'Popular Now': 'popular',
    'Top Rated': 'best movies',
    'Recent Releases': '2024',
    'Classic Movies': 'classic'
  }
  
  const query = filterMap[filter] || filter
  await onSearch(query)
}

const viewMovieDetails = (movie: Movie) => {
  selectedMovie.value = movie
}

const closeMovieDetails = () => {
  selectedMovie.value = null
}

const goToRecommendations = () => {
  router.push('/recommendations')
}

const retryCurrentAction = async () => {
  if (currentAction.value === 'search') {
    await moviesStore.searchMovies(moviesStore.searchQuery)
  } else {
    await loadPopularMovies()
  }
}

const getMoviePoster = (posterPath: string | null): string => {
  return tmdbService.getImageUrl(posterPath, 'w300')
}

const formatYear = (dateString: string): string => {
  return tmdbService.formatReleaseDate(dateString)
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
    console.log(`🔐 Auth required for: ${redirectPath}`)
  }
}

// Handle watch movie - Netflix-like experience
const handleWatchMovie = (movie: Movie) => {
  if (!userStore.isAuthenticated) {
    // Show login modal for unauthenticated users
    userStore.openAuthModal('login')
    console.log(`🔐 Auth required to watch: ${movie.title}`)
    return
  }
  
  // User is authenticated, redirect to watch page
  console.log(`🎬 Redirecting to watch: ${movie.title}`)
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
    console.log(`🎭 Starting hover preview for: ${movie.title}`)
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
    console.log(`🎭 Stopping hover preview for: ${movie.title}`)
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
  0%, 100% {
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