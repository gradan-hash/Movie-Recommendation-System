<template>
  <div class="netflix-home">
    <!-- Featured Hero Section -->
    <FeaturedHero
      :movie="featuredMovie"
      :is-liked="featuredMovie ? userStore.isMovieLiked(featuredMovie.id) : false"
      @watch="handleWatchMovie"
      @more-info="viewMovieDetails"
      @toggle-like="handleMovieLike"
      @explore="scrollToContent"
    />

    <!-- Movie Rows Section -->
    <div class="movie-rows-section py-8 md:py-12">
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
          :movies="aiRecommendations.map(r => r.movie)"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useMoviesStore } from '@/stores'
import { TMDBAPI } from '@/api/tmdb'
import { AIRecommendationService } from '@/services/ai-recommendations'
import FeaturedHero from '@/components/FeaturedHero.vue'
import MovieRow from '@/components/MovieRow.vue'
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
    const response = await TMDBAPI.getPopularMovies(1)
    if (response.success && response.data) {
      targetArray.value = response.data.results.slice(0, 12)
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

// Initialize
onMounted(async () => {
  // Load popular movies (and set featured movie)
  await loadPopularMovies()

  // Load top rated movies
  loadTopRatedMovies()

  // Load genre-specific movies
  loadGenreMovies(28, actionMovies, actionLoading) // Action
  loadGenreMovies(35, comedyMovies, comedyLoading) // Comedy
  loadGenreMovies(18, dramaMovies, dramaLoading) // Drama
  loadGenreMovies(27, horrorMovies, horrorLoading) // Horror

  // Load AI recommendations if user qualifies (delayed)
  if (userStore.canGetRecommendations && aiRecommendations.value.length === 0) {
    setTimeout(() => {
      if (userStore.canGetRecommendations && !aiLoading.value) {
        loadAIRecommendations()
      }
    }, 3000) // Wait 3 seconds for better UX
  }
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

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
