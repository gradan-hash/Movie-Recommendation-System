<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-red-600 to-red-700 p-6 mb-8">
      <div class="container mx-auto">
        <!-- Search Bar -->
        <SearchBar
          :is-searching="moviesStore.loading"
          :total-results="moviesStore.totalResults"
          @search="onSearch"
          @clear="onSearchClear"
          @quick-search="onQuickSearch"
        />
      </div>
    </section>

    <!-- Main Content -->
    <div class="container mx-auto px-4">
      <!-- Welcome Section (when no search and no movies loaded) -->
      <section v-if="showWelcome" class="text-center py-12">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-4xl font-bold mb-6">Welcome to CinemaAI</h2>
          <p class="text-xl text-gray-300 mb-8">
            Discover amazing movies powered by AI recommendations
          </p>
          
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-800 p-6 rounded-lg">
              <div class="text-4xl mb-3">🔍</div>
              <h3 class="text-xl font-semibold mb-2">Discover</h3>
              <p class="text-gray-400">Search thousands of movies from TMDB</p>
            </div>
            
            <div class="bg-gray-800 p-6 rounded-lg">
              <div class="text-4xl mb-3">❤️</div>
              <h3 class="text-xl font-semibold mb-2">Like & Save</h3>
              <p class="text-gray-400">Build your personal collection</p>
            </div>
            
            <div class="bg-gray-800 p-6 rounded-lg">
              <div class="text-4xl mb-3">🤖</div>
              <h3 class="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p class="text-gray-400">Get personalized suggestions</p>
            </div>
          </div>
          
          <button
            @click="loadPopularMovies"
            class="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
          >
            Explore Popular Movies
          </button>
        </div>
      </section>

      <!-- Liked Movies Section (when user has liked movies) -->
      <section v-if="userStore.hasLikedMovies && !moviesStore.isSearching" class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            ❤️ Your Favorites ({{ userStore.likedMoviesCount }})
          </h2>
          <div class="flex gap-2">
            <router-link 
              to="/favorites"
              class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              View All
            </router-link>
            <button 
              v-if="userStore.canGetRecommendations"
              @click="goToRecommendations"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              🤖 Get AI Recommendations
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-4">
          <div
            v-for="movie in userStore.likedMovies.slice(0, 8)"
            :key="movie.id"
            class="relative group cursor-pointer"
            @click="viewMovieDetails(movie)"
          >
            <img
              :src="getMoviePoster(movie.poster_path)"
              :alt="movie.title"
              class="w-full aspect-[2/3] object-cover rounded-lg group-hover:scale-105 transition-transform"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
              <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-center p-2 text-sm">
                {{ movie.title }}
              </span>
            </div>
          </div>
          
          <div
            v-if="userStore.likedMoviesCount > 8"
            class="bg-gray-800 rounded-lg aspect-[2/3] flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
            @click="$router.push('/favorites')"
          >
            <div class="text-center">
              <div class="text-2xl mb-2">+{{ userStore.likedMoviesCount - 8 }}</div>
              <div class="text-sm text-gray-400">more movies</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Movies Grid -->
      <MovieGrid
        :movies="moviesStore.getCurrentMovies"
        :loading="moviesStore.loading"
        :loading-more="moviesStore.loadingMore"
        :error="moviesStore.error"
        :title="currentSectionTitle"
        :icon="currentSectionIcon"
        :show-load-more="moviesStore.canLoadMore"
        :total-results="moviesStore.totalResults"
        :liked-movie-ids="userStore.likedMovieIds"
        @movie-click="viewMovieDetails"
        @view-details="viewMovieDetails"
        @toggle-like="userStore.toggleLike"
        @load-more="moviesStore.loadMoreMovies"
        @retry="retryCurrentAction"
      />
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
import { useRouter } from 'vue-router'


import type { Movie } from '@/types/movie'

import SearchBar from '@/components/SearchBar.vue'
import MovieGrid from '@/components/MovieGrid.vue'
import { useMoviesStore, useUserStore } from '@/stores'
import { tmdbService } from '@/services/tmdb'

// Router
const router = useRouter()

// Stores
const moviesStore = useMoviesStore()
const userStore = useUserStore()

// State
const selectedMovie = ref<Movie | null>(null)
const currentAction = ref<string>('')

// Computed
const showWelcome = computed(() => 
  !moviesStore.loading && 
  !moviesStore.hasPopularMovies && 
  !moviesStore.hasSearchResults &&
  !moviesStore.isSearching
)

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

// Initialize
onMounted(async () => {
  await loadPopularMovies()
})
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 200px);
}
</style>