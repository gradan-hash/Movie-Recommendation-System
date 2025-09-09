<template>
  <div class="recommendations-view min-h-screen bg-gray-900">
    <!-- Hero Section -->
    <section
      class="relative bg-gradient-to-br from-purple-900/30 via-gray-900 to-blue-900/30 py-12 sm:py-16"
    >
      <!-- Background Animation -->
      <div class="absolute inset-0 overflow-hidden opacity-20">
        <div
          class="absolute top-10 left-10 w-32 h-32 sm:w-72 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute bottom-10 right-10 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style="animation-delay: 1s"
        ></div>
      </div>

      <div class="relative container mx-auto px-4 text-center">
        <div
          class="inline-flex items-center gap-3 bg-purple-600/20 backdrop-blur-sm px-4 py-2 rounded-full text-purple-300 text-sm font-medium mb-6"
        >
          <span class="text-xl">🤖</span>
          <span>AI-Powered Recommendations</span>
        </div>

        <h1
          class="text-3xl sm:text-4xl lg:text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4"
        >
          Movies Picked Just for You
        </h1>

        <p class="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
          Our AI analyzed your movie preferences and discovered these hidden gems you'll absolutely
          love
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8 sm:py-12">
      <!-- Insufficient Movies Warning -->
      <div v-if="!userStore.canGetRecommendations" class="text-center py-16">
        <div class="max-w-md mx-auto">
          <!-- Robot Icon -->
          <div
            class="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span class="text-4xl">🤖</span>
          </div>

          <h3 class="text-2xl font-bold text-white mb-4">Need More Data!</h3>
          <p class="text-gray-400 mb-6 leading-relaxed">
            Like at least <strong class="text-purple-400">3 movies</strong> to unlock AI-powered
            recommendations. The more you like, the better our suggestions become!
          </p>

          <!-- Progress Bar -->
          <div class="bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
            <div
              class="bg-gradient-to-r from-purple-600 to-purple-500 h-full rounded-full transition-all duration-300"
              :style="{ width: `${Math.min((userStore.likedMoviesCount / 3) * 100, 100)}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-500 mb-8">{{ userStore.likedMoviesCount }}/3 movies liked</p>

          <router-link
            to="/"
            class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-200 font-semibold shadow-lg shadow-purple-500/25"
          >
            Explore Movies
          </router-link>
        </div>
      </div>

      <!-- AI Recommendations Section -->
      <div v-else>
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="max-w-md mx-auto">
            <!-- AI Brain Animation -->
            <div class="relative w-24 h-24 mx-auto mb-8">
              <div
                class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full animate-spin opacity-20"
              ></div>
              <div
                class="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center"
              >
                <span class="text-3xl animate-pulse">🤖</span>
              </div>
            </div>

            <h3 class="text-xl font-bold text-white mb-4">AI is analyzing your taste...</h3>
            <p class="text-gray-400 mb-6">
              {{ loadingMessages[currentLoadingMessage] }}
            </p>

            <!-- Progress Animation -->
            <div class="bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-purple-600 to-blue-500 h-full rounded-full animate-pulse"
              ></div>
            </div>
          </div>
        </div>

        <!-- Recommendations Content -->
        <div v-else-if="recommendations.length > 0">
          <!-- AI Explanation -->
          <div
            class="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 border border-purple-500/20"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <span class="text-xl">🤖</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white mb-2">AI Analysis</h3>
                <p class="text-gray-300 leading-relaxed">{{ aiExplanation }}</p>
              </div>
            </div>
          </div>

          <!-- Recommendations Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">
                Your Personal Recommendations
              </h2>
              <p class="text-gray-400">{{ recommendations.length }} movies curated by AI</p>
            </div>

            <!-- Refresh Button -->
            <button
              @click="refreshRecommendations"
              :disabled="loading"
              class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'animate-spin': loading }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              New Recommendations
            </button>
          </div>

          <!-- Recommendations Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            <AIRecommendationCard
              v-for="(recommendation, index) in recommendations"
              :key="recommendation.movie.id"
              :recommendation="recommendation"
              :is-liked="userStore.isMovieLiked(recommendation.movie.id)"
              :style="{ animationDelay: `${index * 100}ms` }"
              @click="viewMovieDetails"
              @watch="watchMovie"
              @toggle-like="toggleLike"
            />
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-16">
          <div class="max-w-md mx-auto">
            <div
              class="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span class="text-4xl">⚠️</span>
            </div>

            <h3 class="text-2xl font-bold text-white mb-4">AI Temporarily Unavailable</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">{{ error }}</p>

            <button
              @click="loadRecommendations"
              class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div class="max-w-md mx-auto">
            <div
              class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span class="text-4xl">🎬</span>
            </div>

            <h3 class="text-2xl font-bold text-white mb-4">No Recommendations Yet</h3>
            <p class="text-gray-400 mb-6">
              Unable to generate recommendations at this time. Try refreshing or check back later.
            </p>

            <button
              @click="loadRecommendations"
              class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Generate Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { AIRecommendationService, type AIRecommendation } from '@/services/ai-recommendations'
import AIRecommendationCard from '@/components/AIRecommendationCard.vue'
import type { Movie } from '@/types/movie'

// Router & Store
const router = useRouter()
const userStore = useUserStore()

// State
const loading = ref(false)
const recommendations = ref<AIRecommendation[]>([])
const aiExplanation = ref('')
const error = ref<string | null>(null)
const currentLoadingMessage = ref(0)

// Loading Messages
const loadingMessages = [
  'Analyzing your movie preferences...',
  'Discovering hidden gems...',
  'Consulting AI movie experts...',
  'Finding perfect matches...',
  'Almost ready with your picks!',
]

// Methods
const loadRecommendations = async () => {
  if (!userStore.canGetRecommendations) return

  loading.value = true
  error.value = null

  // Animate loading messages
  const messageInterval = setInterval(() => {
    currentLoadingMessage.value = (currentLoadingMessage.value + 1) % loadingMessages.length
  }, 2000)

  try {
    const response = await AIRecommendationService.generateRecommendations(userStore.likedMovies)

    if (response.success) {
      recommendations.value = response.recommendations
      aiExplanation.value = response.aiExplanation
    } else {
      // Show fallback recommendations if available
      if (response.recommendations.length > 0) {
        recommendations.value = response.recommendations
        aiExplanation.value = response.aiExplanation
      } else {
        error.value = response.error || 'Failed to generate recommendations'
      }
    }
  } catch (err: any) {
    console.error('❌ Failed to load recommendations:', err)
    error.value = err.message || 'Failed to load recommendations'
  } finally {
    loading.value = false
    clearInterval(messageInterval)
    currentLoadingMessage.value = 0
  }
}

const refreshRecommendations = async () => {
  // Clear cache and reload
  AIRecommendationService.clearCache()
  await loadRecommendations()
}

const viewMovieDetails = (recommendation: AIRecommendation) => {
  // Follow same authentication journey as regular movies
  handleWatchMovie(recommendation.movie)
}

const watchMovie = (movie: Movie) => {
  handleWatchMovie(movie)
}

// Handle watch movie with authentication - same as HomeView
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

const toggleLike = (movie: Movie) => {
  if (!userStore.isAuthenticated) {
    userStore.openAuthModal('login')
    return
  }

  userStore.toggleLike(movie)
}

// Initialize
onMounted(() => {
  if (userStore.canGetRecommendations) {
    loadRecommendations()
  }
})
</script>

<style scoped>
/* Custom gradient text */
.bg-gradient-to-r.from-white.via-purple-200.to-blue-200.bg-clip-text.text-transparent {
  background: linear-gradient(135deg, #ffffff 0%, #e9d5ff 50%, #dbeafe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Recommendation cards animation */
.recommendations-view {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
