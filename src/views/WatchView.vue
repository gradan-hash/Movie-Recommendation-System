<template>
  <div class="watch-view min-h-screen bg-black text-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
        <p class="text-xl mt-4 text-gray-300">Loading...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4">⚠️</div>
        <h1 class="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
        <p class="text-gray-300 mb-6">{{ error }}</p>
        <button 
          @click="$router.go(-1)"
          class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Watch Interface -->
    <div v-else-if="content" class="relative">
      <!-- Video Player Section -->
      <section class="relative h-screen bg-black flex items-center justify-center">
        <!-- Placeholder Video Player -->
        <div class="relative w-full h-full bg-gradient-to-b from-gray-800 to-black flex items-center justify-center">
          <!-- Preview Video Placeholder -->
          <div class="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center">
            <!-- Movie Poster as Background -->
            <div 
              class="absolute inset-0 bg-cover bg-center opacity-30"
              :style="{
                backgroundImage: `url(${getBackdropUrl(content.backdrop_path || content.poster_path)})`
              }"
            ></div>
            
            <!-- Video Play Area -->
            <div class="relative z-10 text-center">
              <div class="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-red-500 transition-colors cursor-pointer" @click="startWatching">
                <svg class="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold mb-2">{{ isWatchingFull ? 'Now Playing' : 'Click to Watch' }}</h2>
              <p class="text-gray-400">{{ isWatchingFull ? 'Enjoying the full movie experience' : 'Start watching the full movie' }}</p>
            </div>

            <!-- Movie Progress -->
            <div v-if="isWatchingFull" class="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
              <span class="text-sm">Playing: {{ formatTime(watchTime) }}</span>
              <div class="w-48 h-1 bg-gray-600 rounded-full mt-1">
                <div 
                  class="h-1 bg-red-500 rounded-full transition-all duration-1000"
                  :style="{ width: `${Math.min((watchTime / (content?.runtime || 120)) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overlay Controls -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40">
          <!-- Top Bar -->
          <div class="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
            <button 
              @click="$router.go(-1)"
              class="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>

            <!-- Watch Type Badge -->
            <div class="bg-red-600 px-4 py-2 rounded-full text-sm font-semibold">
              {{ isMovie ? 'Movie' : 'Series' }}
            </div>
          </div>

          <!-- Bottom Info -->
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="max-w-6xl mx-auto">
              <h1 class="text-4xl md:text-6xl font-bold mb-4">{{ content?.title || content?.name || 'Untitled' }}</h1>
              
              <!-- Movie/Series Info -->
              <div class="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <span class="bg-gray-700 px-3 py-1 rounded">{{ getReleaseYear() }}</span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {{ (content.vote_average || 0).toFixed(1) }}
                </span>
                <span v-if="!isMovie && content?.number_of_seasons" class="bg-purple-600 px-3 py-1 rounded">
                  {{ content.number_of_seasons }} Season{{ (content.number_of_seasons || 0) > 1 ? 's' : '' }}
                </span>
                <span v-if="!isMovie && content?.number_of_episodes" class="bg-blue-600 px-3 py-1 rounded">
                  {{ content.number_of_episodes }} Episodes
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap items-center gap-4 mb-6">
                <!-- Play/Pause Button -->
                <button 
                  @click="toggleWatching"
                  class="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-all duration-200 transform hover:scale-105"
                >
                  <svg v-if="!isWatchingFull" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                  </svg>
                  <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  {{ isWatchingFull ? 'Pause' : 'Play Movie' }}
                </button>

                <!-- Add to Favorites -->
                <button 
                  @click="toggleFavorite"
                  class="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  {{ userStore.isMovieLiked(content.id) ? '❤️ Added' : '🤍 Add to Favorites' }}
                </button>

                <!-- Info Button -->
                <button 
                  @click="showMoreInfo"
                  class="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  More Info
                </button>
              </div>

              <!-- Series Episodes (if series) -->
              <div v-if="!isMovie && (content?.number_of_seasons || 0) > 0" class="mb-6">
                <h3 class="text-2xl font-bold mb-4">Episodes</h3>
                <div class="bg-gray-800/50 rounded-lg p-4">
                  <p class="text-gray-300">
                    {{ content?.number_of_episodes || 0 }} episodes available across {{ content?.number_of_seasons || 0 }} seasons
                  </p>
                  <div class="mt-4 flex gap-2">
                    <button 
                      v-for="season in Math.min(content?.number_of_seasons || 1, 5)" 
                      :key="season"
                      @click="selectSeason(season)"
                      class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Season {{ season }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="max-w-2xl">
                <p class="text-gray-300 leading-relaxed">{{ content.overview }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- More Info Modal -->
    <div v-if="showInfoModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click="showInfoModal = false">
      <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold">{{ content?.title || content?.name || 'Untitled' }}</h2>
            <button @click="showInfoModal = false" class="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold mb-2">Overview</h3>
              <p class="text-gray-300">{{ content?.overview || 'No description available.' }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-semibold">Release Date:</span>
                <span class="text-gray-300 ml-2">{{ formatDate(content?.release_date || content?.first_air_date) }}</span>
              </div>
              <div>
                <span class="font-semibold">Rating:</span>
                <span class="text-gray-300 ml-2">{{ (content?.vote_average || 0).toFixed(1) }}/10</span>
              </div>
              <div v-if="content?.genres">
                <span class="font-semibold">Genres:</span>
                <span class="text-gray-300 ml-2">{{ content.genres.map(g => g.name).join(', ') }}</span>
              </div>
              <div v-if="content?.runtime">
                <span class="font-semibold">Runtime:</span>
                <span class="text-gray-300 ml-2">{{ content.runtime }} minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import { TMDBAPI } from '@/api/tmdb'
import type { MovieDetails } from '@/types/movie'

// Extended type for both movies and series
interface WatchContent extends MovieDetails {
  name?: string // TV series name
  first_air_date?: string // TV series first air date
  number_of_seasons?: number
  number_of_episodes?: number
  seasons?: any[]
}

// Props
const props = defineProps<{
  id: string
}>()

// Composables
const route = useRoute()
const userStore = useUserStore()

// State
const content = ref<WatchContent | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showInfoModal = ref(false)
const isWatchingFull = ref(false)
const watchTime = ref(0)
const watchTimer = ref<number | null>(null)

// Computed
const isMovie = computed(() => route.name === 'watch-movie')
const contentType = computed(() => isMovie.value ? 'movie' : 'series')

// Methods
const loadContent = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log(`🎬 Loading ${contentType.value} details for ID: ${props.id}`)
    
    const response = await TMDBAPI.getMovieDetails(Number(props.id))
    
    if (response.success && response.data) {
      content.value = response.data
      console.log(`✅ ${contentType.value} loaded:`, content.value.title || content.value.name)
    } else {
      throw new Error(response.error || `Failed to load ${contentType.value}`)
    }
  } catch (err: any) {
    console.error(`❌ Error loading ${contentType.value}:`, err.message)
    error.value = err.message || `Failed to load ${contentType.value}`
  } finally {
    loading.value = false
  }
}

const getBackdropUrl = (path: string | null): string => {
  if (!path) return 'https://via.placeholder.com/1920x1080/1a1a1a/666666?text=No+Image'
  return `https://image.tmdb.org/t/p/w1280${path}`
}

const getReleaseYear = (): string => {
  if (!content.value) return 'Unknown'
  const date = content.value.release_date || content.value.first_air_date
  return date ? new Date(date).getFullYear().toString() : 'Unknown'
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const startWatching = () => {
  const title = content.value?.title || content.value?.name || 'Unknown Title'
  console.log(`🎬 Starting full movie: ${title}`)
  
  isWatchingFull.value = true
  watchTime.value = 0
  
  // Start movie timer (simulates movie progress)
  watchTimer.value = window.setInterval(() => {
    watchTime.value += 1
    // Auto-stop when movie ends (using runtime in minutes * 60)
    const movieDuration = (content.value?.runtime || 120) * 60
    if (watchTime.value >= movieDuration) {
      stopWatching()
    }
  }, 1000)
  
  // Here you would integrate with your actual video player
  console.log(`🎬 Movie started: ${title}`)
}

const stopWatching = () => {
  console.log('⏹️ Stopping movie')
  isWatchingFull.value = false
  if (watchTimer.value) {
    clearInterval(watchTimer.value)
    watchTimer.value = null
  }
}

const toggleWatching = () => {
  if (isWatchingFull.value) {
    stopWatching()
  } else {
    startWatching()
  }
}

const toggleFavorite = () => {
  if (!content.value) return
  
  // Convert WatchContent to Movie format for store
  const movie = {
    id: content.value.id,
    title: content.value.title || content.value.name || '',
    overview: content.value.overview || '',
    poster_path: content.value.poster_path || '',
    backdrop_path: content.value.backdrop_path || '',
    release_date: content.value.release_date || content.value.first_air_date || '',
    vote_average: content.value.vote_average || 0,
    genre_ids: content.value.genres?.map(g => g.id) || [],
    adult: content.value.adult || false,
    original_language: content.value.original_language || 'en',
    original_title: content.value.original_title || content.value.title || content.value.name || '',
    popularity: content.value.popularity || 0,
    video: false,
    vote_count: content.value.vote_count || 0
  }
  
  userStore.toggleLike(movie)
}

const showMoreInfo = () => {
  showInfoModal.value = true
}

const selectSeason = (season: number) => {
  console.log(`📺 Selected season ${season}`)
  // Here you would load episodes for the selected season
  alert(`Loading Season ${season} episodes...`)
}

// Lifecycle
onMounted(() => {
  loadContent()
})

onUnmounted(() => {
  if (watchTimer.value) {
    clearInterval(watchTimer.value)
  }
})
</script>

<style scoped>
.watch-view {
  font-family: 'Inter', sans-serif;
}

/* Smooth animations */
.transition-all {
  transition: all 0.3s ease;
}

.transform:hover {
  transform: scale(1.05);
}

/* Custom scrollbar */
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

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>