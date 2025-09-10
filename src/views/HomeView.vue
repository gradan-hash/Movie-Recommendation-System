<template>
  <div class="netflix-home">
    <!-- Featured Hero Section - Hide during search -->
    <FeaturedHero
      v-if="!isSearchMode"
      :movie="featuredMovie"
      :is-liked="featuredMovie ? userStore.isMovieLiked(featuredMovie.id) : false"
      @watch="handleWatchMovie"
      @more-info="viewMovieDetails"
      @toggle-like="handleMovieLike"
      @explore="scrollToContent"
    />

    <!-- Search Results Section -->
    <div v-if="isSearchMode" class="search-results-section py-8">
      <div class="container mx-auto px-4">
        <div class="mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <font-awesome-icon icon="search" class="text-red-400" />
            Search Results for "{{ searchQuery }}"
          </h1>
          <p class="text-gray-400" v-if="searchResults.length > 0">
            {{ searchResults.length }} movies found
          </p>
        </div>

        <MovieGrid
          :movies="searchResults"
          :loading="searchLoading"
          :error="searchError"
          :show-load-more="false"
          :use-pagination="false"
          :liked-movie-ids="userStore.likedMovieIds"
          @movie-click="viewMovieDetails"
          @view-details="viewMovieDetails"
          @toggle-like="handleMovieLike"
          @watch-movie="handleWatchMovie"
        />
      </div>
    </div>

    <!-- Movie Rows Section - Hide during search -->
    <div v-if="!isSearchMode" class="movie-rows-section py-4 md:py-12">
      <div class="container mx-auto">
        <!-- Your Favorites Row -->
        <MovieRow
          v-if="userStore.hasLikedMovies"
          title="Your Favorites"
          icon="heart"
          :movies="userStore.likedMovies.slice(0, 12)"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
          @view-all="() => router.push('/favorites')"
        />

        <!-- AI Recommendations Row -->
        <MovieRow
          v-if="userStore.canGetRecommendations && aiRecommendations.length > 0"
          title="AI Recommendations"
          icon="robot"
          :movies="aiRecommendations.map((r: { movie: any }) => r.movie)"
          :loading="aiLoading"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
          @view-all="() => router.push('/recommendations')"
        />

        <!-- Continue Watching Row (Placeholder) -->
        <MovieRow
          v-if="userStore.isAuthenticated && recentlyWatched.length > 0"
          title="Continue Watching"
          icon="film"
          :movies="recentlyWatched"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
          :show-view-all="false"
        />

        <!-- Popular Movies Row -->
        <MovieRow
          title="Popular Movies"
          icon="fire"
          :movies="moviesStore.popularMovies.slice(0, 12)"
          :loading="moviesStore.loading"
          :error="moviesStore.error"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
          @retry="loadPopularMovies"
        />

        <!-- Top Rated Movies Row -->
        <MovieRow
          title="Top Rated Movies"
          icon="star"
          :movies="topRatedMovies"
          :loading="topRatedLoading"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
        />

        <!-- Action Movies Row -->
        <MovieRow
          title="Action Movies"
          icon="bolt"
          :movies="actionMovies"
          :loading="actionLoading"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
        />

        <!-- Comedy Movies Row -->
        <MovieRow
          title="Comedy Movies"
          icon="laugh"
          :movies="comedyMovies"
          :loading="comedyLoading"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
        />

        <!-- Drama Movies Row -->
        <MovieRow
          title="Drama Movies"
          icon="theater-masks"
          :movies="dramaMovies"
          :loading="dramaLoading"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
        />

        <!-- Horror Movies Row -->
        <MovieRow
          title="Horror Movies"
          icon="ghost"
          :movies="horrorMovies"
          :loading="horrorLoading"
          :is-movie-liked="(id: number) => userStore.isMovieLiked(id)"
          @movie-click="viewMovieDetails"
          @watch-movie="handleWatchMovie"
          @toggle-like="handleMovieLike"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useMoviesStore } from '@/stores'
import { TMDBAPI } from '@/api/tmdb'
import { AIRecommendationService } from '@/services/ai-recommendations'
import FeaturedHero from '@/components/FeaturedHero.vue'
import MovieRow from '@/components/MovieRow.vue'
import MovieGrid from '@/components/MovieGrid.vue'
import type { Movie } from '@/types/movie'
import type { AIRecommendation } from '@/services/ai-recommendations'

// Stores and Router
const userStore = useUserStore()
const moviesStore = useMoviesStore()
const router = useRouter()

// State
const featuredMovie = ref<Movie | null>(null)
const aiRecommendations = ref<AIRecommendation[]>([])
const aiLoading = ref(false)
const recentlyWatched = ref<Movie[]>([])

// Search state
const isSearchMode = ref(false)
const searchQuery = ref('')
const searchResults = ref<Movie[]>([])
const searchLoading = ref(false)
const searchError = ref('')

// Genre-specific movies
const topRatedMovies = ref<Movie[]>([])
const actionMovies = ref<Movie[]>([])
const comedyMovies = ref<Movie[]>([])
const dramaMovies = ref<Movie[]>([])
const horrorMovies = ref<Movie[]>([])

// Loading states
const topRatedLoading = ref(false)
const actionLoading = ref(false)
const comedyLoading = ref(false)
const dramaLoading = ref(false)
const horrorLoading = ref(false)

// Methods
const loadPopularMovies = async () => {
  await moviesStore.loadPopularMovies()

  // Set featured movie from popular movies
  if (moviesStore.popularMovies.length > 0) {
    featuredMovie.value = moviesStore.popularMovies[0]
  }
}

const loadTopRatedMovies = async () => {
  topRatedLoading.value = true
  try {
    const response = await TMDBAPI.getTopRatedMovies(1)
    if (response.success && response.data) {
      topRatedMovies.value = response.data.results.slice(0, 12)
    }
  } catch (error) {
    console.warn('Failed to load top rated movies:', error)
  } finally {
    topRatedLoading.value = false
  }
}

const loadGenreMovies = async (genreId: number, targetArray: any, loadingRef: any) => {
  loadingRef.value = true
  try {
    // For now, use popular movies and randomize for different genres
    const response = await TMDBAPI.getPopularMovies(1)
    if (response.success && response.data) {
      // Simulate different genre movies by shuffling popular movies
      const shuffled = [...response.data.results].sort(() => Math.random() - 0.5)
      targetArray.value = shuffled.slice(0, 12)
    }
  } catch (error) {
    console.warn(`Failed to load genre ${genreId} movies:`, error)
  } finally {
    loadingRef.value = false
  }
}

const loadAIRecommendations = async () => {
  if (!userStore.canGetRecommendations || aiLoading.value) return

  aiLoading.value = true
  try {
    const response = await AIRecommendationService.generateRecommendations(userStore.likedMovies)

    if (response.success || response.recommendations.length > 0) {
      aiRecommendations.value = response.recommendations
    }
  } catch (err: any) {
    console.warn('Failed to load AI recommendations:', err)
  } finally {
    aiLoading.value = false
  }
}

const viewMovieDetails = (movie: Movie) => {
  router.push(`/watch/movie/${movie.id}`)
}

const handleWatchMovie = async (movie: Movie) => {
  if (userStore.authLoading) return

  if (!userStore.isAuthenticated) {
    userStore.openAuthModal('login')
    return
  }

  router.push(`/watch/movie/${movie.id}`)
}

const handleMovieLike = (movie: Movie) => {
  if (!userStore.isAuthenticated) {
    userStore.openAuthModal('login')
    return
  }

  userStore.toggleLike(movie)
}

const scrollToContent = () => {
  const movieRows = document.querySelector('.movie-rows-section')
  if (movieRows) {
    movieRows.scrollIntoView({ behavior: 'smooth' })
  }
}

// Search functionality
const performSearch = async (query: string) => {
  if (!query.trim()) return

  searchLoading.value = true
  searchError.value = ''
  searchQuery.value = query
  isSearchMode.value = true

  try {
    const response = await TMDBAPI.searchMovies(query, 1)
    if (response.success && response.data) {
      searchResults.value = response.data.results
    } else {
      searchError.value = 'Failed to search movies'
      searchResults.value = []
    }
  } catch (error) {
    console.error('Search failed:', error)
    searchError.value = 'Search failed. Please try again.'
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const clearSearch = () => {
  isSearchMode.value = false
  searchQuery.value = ''
  searchResults.value = []
  searchError.value = ''
  searchLoading.value = false
}

// Global search event listeners
const handleHomepageSearch = (event: CustomEvent) => {
  const { query } = event.detail
  performSearch(query)
}

const handleHomepageSearchClear = () => {
  clearSearch()
}

// Progressive loading for mobile performance
const loadContentProgressively = async () => {
  // Load critical content first (popular movies and featured hero)
  await loadPopularMovies()

  // Load secondary content with delays for mobile optimization
  setTimeout(() => loadTopRatedMovies(), 500)

  // Load genre movies with staggered delays to prevent mobile lag
  setTimeout(() => loadGenreMovies(28, actionMovies, actionLoading), 1000) // Action
  setTimeout(() => loadGenreMovies(35, comedyMovies, comedyLoading), 1500) // Comedy
  setTimeout(() => loadGenreMovies(18, dramaMovies, dramaLoading), 2000) // Drama
  setTimeout(() => loadGenreMovies(27, horrorMovies, horrorLoading), 2500) // Horror

  // Load AI recommendations last (delayed for better UX)
  if (userStore.canGetRecommendations && aiRecommendations.value.length === 0) {
    setTimeout(() => {
      if (userStore.canGetRecommendations && !aiLoading.value) {
        loadAIRecommendations()
      }
    }, 3000)
  }
}

// Initialize
onMounted(() => {
  loadContentProgressively()

  // Add search event listeners
  window.addEventListener('homepage-search', handleHomepageSearch as EventListener)
  window.addEventListener('homepage-search-clear', handleHomepageSearchClear)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('homepage-search', handleHomepageSearch as EventListener)
  window.removeEventListener('homepage-search-clear', handleHomepageSearchClear)
})
</script>

<style scoped>
.netflix-home {
  background: #141414;
  min-height: 100vh;
}

.movie-rows-section {
  background: linear-gradient(to bottom, transparent, #141414 20%);
}

/* Smooth scrolling and mobile optimizations */
html {
  scroll-behavior: smooth;
}

/* Mobile performance optimizations */
@media (max-width: 768px) {
  .netflix-home {
    /* Enable hardware acceleration for better mobile performance */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    /* Optimize touch scrolling */
    -webkit-overflow-scrolling: touch;
  }

  /* Reduce motion for mobile to improve performance */
  .movie-rows-section * {
    transition-duration: 0.2s !important;
  }

  /* Optimize image rendering on mobile */
  img {
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
  }

  /* Improve touch targets */
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>
