<template>
  <div class="ai-recommendation-card relative group">
    <!-- AI Badge -->
    <div class="absolute top-2 left-2 z-10">
      <div
        class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg"
      >
        <span v-if="recommendation.aiGenerated"></span>
        <span v-else>🔗</span>
        {{ recommendation.aiGenerated ? 'AI Pick' : 'Similar' }}
      </div>
    </div>

    <!-- Confidence Score -->
    <div class="absolute top-2 right-2 z-10">
      <div
        class="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
      >
        ⭐ {{ recommendation.confidence }}/10
      </div>
    </div>

    <!-- Movie Card -->
    <div
      class="relative aspect-[2/3] overflow-hidden rounded-xl shadow-xl group-hover:shadow-2xl transition-all duration-300 cursor-pointer transform group-hover:scale-105"
      @click="$emit('click', recommendation)"
    >
      <!-- Movie Poster -->
      <img
        :src="getMoviePoster(recommendation.movie.poster_path)"
        :alt="recommendation.movie.title"
        class="w-full h-full object-cover transition-opacity duration-300"
        :class="{ 'opacity-30': showOverlay }"
        @mouseenter="showOverlay = true"
        @mouseleave="showOverlay = false"
      />

      <!-- Gradient Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <!-- AI Reason Overlay -->
      <div
        v-if="showOverlay"
        class="absolute inset-0 flex items-center justify-center p-4"
        @mouseenter="showOverlay = true"
        @mouseleave="showOverlay = false"
      >
        <div class="text-center text-white">
          <!-- AI Icon -->
          <div
            class="w-16 h-16 bg-purple-600/80 rounded-full flex items-center justify-center mb-3 mx-auto animate-pulse"
          >
            <span class="text-2xl">{{ recommendation.aiGenerated }}</span>
          </div>

          <!-- AI Reason -->
          <p class="text-sm font-medium mb-2 leading-tight">{{ recommendation.reason }}</p>

          <!-- Watch Button -->
          <button
            @click.stop="$emit('watch', recommendation.movie)"
            class="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 mx-auto transition-colors"
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

      <!-- Movie Info -->
      <div
        class="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
      >
        <h3 class="text-white font-bold text-sm mb-1 line-clamp-2">
          {{ recommendation.movie.title }}
        </h3>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2 text-yellow-400 text-xs">
            <span>⭐</span>
            <span>{{ recommendation.movie.vote_average.toFixed(1) }}</span>
          </div>
          <div class="text-gray-300 text-xs">
            {{ formatReleaseYear(recommendation.movie.release_date) }}
          </div>
        </div>

        <!-- Like Button -->
        <button
          @click.stop="$emit('toggle-like', recommendation.movie)"
          class="w-full bg-gray-800/80 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg hover:bg-gray-700/80 transition-colors text-xs font-medium flex items-center justify-center gap-1"
        >
          <span v-if="isLiked">❤️</span>
          <span v-else>🤍</span>
          {{ isLiked ? 'Liked' : 'Like' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AIRecommendation } from '@/services/ai-recommendations'
import type { Movie } from '@/types/movie'
import { getImageUrl } from '@/api/tmdb'

interface Props {
  recommendation: AIRecommendation
  isLiked?: boolean
}

defineProps<Props>()

defineEmits<{
  click: [recommendation: AIRecommendation]
  watch: [movie: Movie]
  'toggle-like': [movie: Movie]
}>()

// State
const showOverlay = ref(false)

// Methods
const getMoviePoster = (posterPath: string | null): string => {
  return getImageUrl(posterPath, 'w300')
}

const formatReleaseYear = (dateString: string): string => {
  try {
    return new Date(dateString).getFullYear().toString()
  } catch {
    return 'Unknown'
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-recommendation-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Gradient glow for AI recommendations */
.ai-recommendation-card:hover {
  filter: drop-shadow(0 8px 25px rgba(147, 51, 234, 0.3));
}
</style>
