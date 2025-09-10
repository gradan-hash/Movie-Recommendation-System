<template>
  <section
    class="featured-hero relative h-[50vh] md:h-[70vh] overflow-hidden"
    @mouseenter="startPreview"
    @mouseleave="endPreview"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchmove="handleTouchMove"
    @click="handleClick"
  >
    <!-- Background Video/Image -->
    <div class="absolute inset-0" v-if="movie">
      <!-- Auto-playing Video (Netflix-style) - Enhanced mobile compatibility -->
      <video
        v-if="videoUrl && !videoError"
        ref="heroVideo"
        :src="videoUrl"
        class="w-full h-full object-cover"
        muted
        loop
        playsinline
        webkit-playsinline="true"
        preload="metadata"
        :poster="getMovieBackdrop(movie.backdrop_path)"
        @loadstart="videoLoading = true"
        @canplay="videoLoading = false"
        @error="handleVideoError"
        @loadedmetadata="onVideoReady"
      ></video>

      <!-- Fallback Image (if video fails) -->
      <img
        v-show="!videoUrl || videoError"
        :src="getMovieBackdrop(movie.backdrop_path)"
        :alt="movie.title"
        class="w-full h-full object-cover"
        loading="eager"
      />

      <!-- Loading Spinner for Video -->
      <div
        v-if="videoLoading && !videoError"
        class="absolute inset-0 flex items-center justify-center bg-black/20"
      >
        <div
          class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"
        ></div>
      </div>

      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      <div
        class="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"
      ></div>
    </div>

    <!-- Fallback Background -->
    <div
      v-else
      class="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-purple-900/20"
    >
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style="animation-delay: 1s"
        ></div>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 h-full flex items-end">
      <div class="container mx-auto px-3 pb-8 md:pb-20">
        <div class="max-w-2xl">
          <!-- Featured Movie Content -->
          <div v-if="movie">
            <!-- Movie Title -->
            <h1
              class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-4 leading-tight drop-shadow-2xl transition-all duration-500"
              :class="{ 'opacity-100': !isPreviewMode, 'opacity-90': isPreviewMode }"
            >
              {{ movie.title }}
            </h1>

            <!-- Movie Info -->
            <div
              class="flex items-center gap-2 md:gap-4 mb-3 md:mb-4 text-white/90 transition-all duration-500"
              :class="{
                'opacity-100 translate-y-0': !isPreviewMode,
                'opacity-0 -translate-y-4': isPreviewMode,
              }"
            >
              <div class="flex items-center gap-1 text-yellow-400">
                <font-awesome-icon icon="star" class="text-sm md:text-base" />
                <span class="font-bold text-sm md:text-base">{{
                  movie.vote_average.toFixed(1)
                }}</span>
              </div>
              <div class="text-sm md:text-base">{{ getReleaseYear(movie.release_date) }}</div>
              <div class="hidden md:block">
                <span class="bg-white/20 px-3 py-1 rounded text-sm font-medium">Movie</span>
              </div>
            </div>

            <!-- Movie Overview -->
            <p
              class="text-gray-200 text-sm md:text-lg leading-relaxed mb-4 md:mb-8 max-w-xl drop-shadow-lg line-clamp-3 md:line-clamp-none transition-all duration-500"
              :class="{
                'opacity-100 translate-y-0': !isPreviewMode,
                'opacity-0 -translate-y-4': isPreviewMode,
              }"
            >
              {{ movie.overview }}
            </p>

            <!-- Action Buttons -->
            <div
              class="flex flex-col sm:flex-row gap-2 md:gap-4 transition-all duration-500"
              :class="{
                'opacity-100 translate-y-0': !isPreviewMode,
                'opacity-0 translate-y-4': isPreviewMode,
              }"
            >
              <button
                @click="$emit('watch', movie)"
                class="bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl"
              >
                <font-awesome-icon icon="film" class="text-sm md:text-base" />
                <span>Watch Now</span>
              </button>

              <button
                @click="$emit('more-info', movie)"
                class="bg-gray-600/80 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-gray-500/80 transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <font-awesome-icon icon="info-circle" class="text-sm md:text-base" />
                <span>More Info</span>
              </button>

              <button
                @click="$emit('toggle-like', movie)"
                :class="[
                  'px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm border-2',
                  isLiked
                    ? 'bg-red-600/80 text-white border-red-600 hover:bg-red-500/80'
                    : 'bg-transparent text-white border-white/60 hover:border-white hover:bg-white/10',
                ]"
              >
                <font-awesome-icon icon="heart" class="text-sm md:text-base" />
                <span class="hidden sm:inline">{{ isLiked ? 'Liked' : 'Add to List' }}</span>
                <span class="sm:hidden">{{ isLiked ? 'Liked' : 'Like' }}</span>
              </button>
            </div>
          </div>

          <!-- Default Hero Content -->
          <div v-else>
            <h1
              class="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 drop-shadow-2xl"
            >
              CinemaAI
            </h1>
            <p
              class="text-base md:text-lg text-gray-200 mb-4 md:mb-8 max-w-3xl leading-relaxed drop-shadow-lg"
            >
              Discover your next favorite movie with
              <span class="text-red-400 font-semibold">AI-powered recommendations</span>
              and explore thousands of films from around the world
            </p>
            <button
              @click="$emit('explore')"
              class="bg-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-red-700 transition-all duration-200 flex items-center gap-2 shadow-2xl"
            >
              <font-awesome-icon icon="search" class="text-sm md:text-base" />
              <span>Start Exploring</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Controls (Netflix-style) - Show on both mobile and desktop during preview -->
    <div
      v-if="isPreviewMode && videoUrl && !videoError"
      class="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex gap-2"
    >
      <!-- Play/Pause Button -->
      <button
        @click="togglePlayPause"
        class="w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" class="text-sm md:text-base" />
      </button>

      <!-- Audio Toggle -->
      <button
        @click="toggleMuted"
        class="w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        <font-awesome-icon
          :icon="isMuted ? 'volume-mute' : 'volume-up'"
          class="text-sm md:text-base"
        />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Movie } from '@/types/movie'

// Props
interface Props {
  movie?: Movie | null
  isLiked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  movie: null,
  isLiked: false,
})

// Emits
defineEmits<{
  watch: [movie: Movie]
  'more-info': [movie: Movie]
  'toggle-like': [movie: Movie]
  explore: []
}>()

// State
const isMuted = ref(true)
const isPlaying = ref(true)
const videoLoading = ref(false)
const videoError = ref(false)
const isMobile = ref(false)
const isPreviewMode = ref(false)
const heroVideo = ref<HTMLVideoElement>()
const previewTimer = ref<NodeJS.Timeout>()
const touchStartTime = ref<number>(0)
const touchStartPos = ref({ x: 0, y: 0 })
const userHasInteracted = ref(false)

// Sample video URL - in a real app, you'd get this from the movie data
const videoUrl = ref<string | null>(null)

// Methods
const getMovieBackdrop = (backdropPath: string | null): string => {
  if (!backdropPath) {
    return 'https://images.unsplash.com/photo-1489599849250-75c6aa2e5c30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  }
  return `https://image.tmdb.org/t/p/original${backdropPath}`
}

const getReleaseYear = (releaseDate: string): string => {
  return new Date(releaseDate).getFullYear().toString()
}

const toggleMuted = () => {
  isMuted.value = !isMuted.value
  if (heroVideo.value) {
    heroVideo.value.muted = isMuted.value
  }
}

const togglePlayPause = () => {
  if (!heroVideo.value) return

  if (isPlaying.value) {
    heroVideo.value.pause()
  } else {
    heroVideo.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const handleVideoError = () => {
  videoError.value = true
  console.warn('Hero video failed to load, falling back to image')
}

const onVideoReady = () => {
  // Video metadata is loaded - prepare for mobile playback
  if (heroVideo.value && isMobile.value) {
    // Set all mobile-friendly attributes
    heroVideo.value.muted = true
    heroVideo.value.playsInline = true
    heroVideo.value.setAttribute('webkit-playsinline', 'true')
    heroVideo.value.setAttribute('x-webkit-airplay', 'allow')

    console.log('Video ready for mobile playback')
  }
}

const checkMobile = () => {
  isMobile.value =
    window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const initVideo = () => {
  // For demo purposes, use a sample video URL
  // In a real app, you'd get trailer URLs from TMDB or your API
  if (props.movie) {
    // Sample Netflix-style video URL (works on both mobile and desktop)
    videoUrl.value =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }
}

const startPreview = async () => {
  if (!videoUrl.value || videoError.value) return

  // On mobile with user interaction, try immediate preview
  if (isMobile.value && userHasInteracted.value) {
    isPreviewMode.value = true
    await tryVideoPlay()
    return
  }

  // Shorter delay on mobile for better responsiveness
  const delay = isMobile.value ? 800 : 1500

  // Start preview mode after a delay
  previewTimer.value = setTimeout(async () => {
    isPreviewMode.value = true

    if (isMobile.value) {
      // On mobile, use enhanced play method
      await tryVideoPlay()
    } else {
      // On desktop, use original method
      if (heroVideo.value) {
        heroVideo.value.play().catch(() => {
          console.warn('Video autoplay failed - this is normal on some mobile devices')
        })
        isPlaying.value = true
      }
    }
  }, delay)
}

const endPreview = () => {
  // Clear the timer
  if (previewTimer.value) {
    clearTimeout(previewTimer.value)
    previewTimer.value = undefined
  }

  // Exit preview mode
  isPreviewMode.value = false

  // Pause video if it was playing in preview mode
  if (heroVideo.value && isPlaying.value) {
    heroVideo.value.pause()
    isPlaying.value = false
  }
}

// Enhanced mobile touch handlers for better preview functionality
const handleTouchStart = (event: TouchEvent) => {
  if (!isMobile.value) return

  const touch = event.touches[0]
  touchStartTime.value = Date.now()
  touchStartPos.value = { x: touch.clientX, y: touch.clientY }

  // Mark user interaction for video autoplay permission
  userHasInteracted.value = true

  startPreview()
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!isMobile.value) return

  const touchDuration = Date.now() - touchStartTime.value
  const touch = event.changedTouches[0]
  const touchEndPos = { x: touch.clientX, y: touch.clientY }

  // Calculate distance moved
  const distance = Math.sqrt(
    Math.pow(touchEndPos.x - touchStartPos.value.x, 2) +
      Math.pow(touchEndPos.y - touchStartPos.value.y, 2)
  )

  // If it's a short tap (less than 500ms) and didn't move much (less than 20px)
  // treat it as a tap to start/maintain preview
  if (touchDuration < 500 && distance < 20) {
    if (!isPreviewMode.value) {
      startPreview()
    }
    // Don't end preview on tap - let user interact with preview
    return
  }

  // For longer touches or swipes, end preview after delay
  setTimeout(() => {
    if (!isPreviewMode.value) return
    endPreview()
  }, 2000) // Keep preview for 2 seconds after touch end
}

const handleTouchMove = (event: TouchEvent) => {
  // Prevent default to avoid scrolling issues during preview
  if (isPreviewMode.value) {
    event.preventDefault()
  }
}

const handleClick = () => {
  // For desktop clicks or mobile taps that bypass touch events
  if (!isMobile.value) return

  userHasInteracted.value = true

  if (!isPreviewMode.value) {
    startPreview()
  }
}

// Enhanced video initialization with better mobile support
const tryVideoPlay = async (): Promise<boolean> => {
  if (!heroVideo.value || !videoUrl.value || videoError.value) return false

  try {
    // Ensure video is muted and has correct attributes for mobile
    heroVideo.value.muted = true
    heroVideo.value.playsInline = true
    heroVideo.value.setAttribute('webkit-playsinline', 'true')

    await heroVideo.value.play()
    isPlaying.value = true
    return true
  } catch (error) {
    console.warn('Video autoplay failed:', error)
    return false
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  initVideo()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (previewTimer.value) {
    clearTimeout(previewTimer.value)
  }
})
</script>

<style scoped>
/* Ensure text is readable with shadow */
.drop-shadow-2xl {
  filter: drop-shadow(0 25px 25px rgb(0 0 0 / 0.8));
}

.drop-shadow-lg {
  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.6));
}

/* Smooth animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.featured-hero {
  animation: fadeInUp 1s ease-out;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .featured-hero {
    min-height: 50vh;
  }
}

/* Line clamp utility for mobile overview text */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
