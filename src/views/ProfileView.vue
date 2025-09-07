<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="userStore.authLoading" class="flex justify-center py-20">
      <LoadingSpinner size="large" text="Loading profile..." />
    </div>

    <!-- Profile Content -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="bg-gray-800 rounded-lg p-6 mb-8">
        <div class="flex items-center gap-6">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {{ userStore.userInitials }}
            </div>
            <button class="absolute bottom-0 right-0 bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8-3-3-8 8v3z"></path>
              </svg>
            </button>
          </div>

          <!-- User Info -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-white mb-2">{{ userStore.userDisplayName }}</h1>
            <p class="text-gray-400 mb-2">{{ userStore.currentUser?.email }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span>{{ userStore.likedMoviesCount }} movies liked</span>
              <span v-if="userStore.currentUser?.emailVerified" class="flex items-center gap-1 text-green-400">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                Verified
              </span>
              <span v-else class="flex items-center gap-1 text-yellow-400">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                Unverified
              </span>
            </div>
          </div>

          <!-- Profile Actions -->
          <div class="flex flex-col gap-2">
            <button 
              @click="showEditProfile = true"
              class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Edit Profile
            </button>
            <button 
              @click="userStore.exportUserData()"
              class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gray-800 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-red-400 mb-2">{{ userStore.likedMoviesCount }}</div>
          <div class="text-gray-400">Movies Liked</div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-purple-400 mb-2">
            {{ userStore.canGetRecommendations ? 'Available' : 'Locked' }}
          </div>
          <div class="text-gray-400">AI Recommendations</div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-blue-400 mb-2">
            {{ movieStats?.averageRating || 0 }}⭐
          </div>
          <div class="text-gray-400">Average Rating</div>
        </div>
      </div>

      <!-- Movie Statistics -->
      <div v-if="movieStats" class="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-bold text-white mb-6">Your Movie Preferences</h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Favorite Genres -->
          <div>
            <h3 class="text-white font-semibold mb-3">Top Genres</h3>
            <div class="space-y-2">
              <div v-for="[genreId, count] in movieStats.favoriteGenres" :key="genreId" class="flex justify-between items-center">
                <span class="text-gray-300">Genre {{ genreId }}</span>
                <span class="text-red-400 font-semibold">{{ count }} movies</span>
              </div>
            </div>
          </div>

          <!-- Favorite Years -->
          <div>
            <h3 class="text-white font-semibold mb-3">Favorite Years</h3>
            <div class="space-y-2">
              <div v-for="[year, count] in movieStats.favoriteYears" :key="year" class="flex justify-between items-center">
                <span class="text-gray-300">{{ year }}</span>
                <span class="text-blue-400 font-semibold">{{ count }} movies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liked Movies Section -->
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-white">Your Liked Movies</h2>
          <router-link 
            to="/favorites"
            class="text-red-400 hover:text-red-300 text-sm font-semibold"
          >
            View All →
          </router-link>
        </div>

        <!-- Movies Grid Preview -->
        <div v-if="userStore.hasLikedMovies" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="movie in userStore.likedMovies.slice(0, 12)"
            :key="movie.id"
            class="relative group cursor-pointer"
            @click="viewMovieDetails(movie)"
          >
            <img
              :src="getMoviePoster(movie.poster_path)"
              :alt="movie.title"
              class="w-full aspect-[2/3] object-cover rounded-lg group-hover:scale-105 transition-transform"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors rounded-lg flex items-center justify-center">
              <div class="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-2">
                <h3 class="font-semibold text-sm mb-1">{{ movie.title }}</h3>
                <div class="flex items-center justify-center gap-1 text-yellow-400 text-xs">
                  <span>⭐</span>
                  <span>{{ movie.vote_average.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">❤️</div>
          <h3 class="text-xl font-bold text-white mb-2">No liked movies yet</h3>
          <p class="text-gray-400 mb-4">Start exploring and like movies to build your profile</p>
          <router-link 
            to="/"
            class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Explore Movies
          </router-link>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div 
      v-if="showEditProfile"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      @click="showEditProfile = false"
    >
      <div 
        class="bg-gray-800 rounded-lg max-w-md w-full p-6"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-white">Edit Profile</h2>
          <button
            @click="showEditProfile = false"
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="updateProfile">
          <div class="mb-4">
            <label class="block text-white text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              v-model="profileForm.displayName"
              type="text"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Enter your display name"
            />
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="profileLoading"
              class="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ profileLoading ? 'Updating...' : 'Update Profile' }}
            </button>
            <button
              type="button"
              @click="showEditProfile = false"
              class="px-6 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { tmdbService } from '@/services/tmdb'
import type { Movie } from '@/types/movie'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

// Store
const userStore = useUserStore()

// State
const showEditProfile = ref(false)
const profileLoading = ref(false)
const profileForm = ref({
  displayName: ''
})

// Computed
const movieStats = computed(() => userStore.getMovieStats)

// Methods
const getMoviePoster = (posterPath: string | null): string => {
  return tmdbService.getImageUrl(posterPath, 'w300')
}

const viewMovieDetails = (movie: Movie) => {
  console.log('View details for:', movie.title)
  // TODO: Implement movie details modal or navigate to details page
}

const updateProfile = async () => {
  profileLoading.value = true
  
  try {
    await userStore.updateProfile(profileForm.value.displayName)
    showEditProfile.value = false
  } catch (error) {
    console.error('Failed to update profile:', error)
  } finally {
    profileLoading.value = false
  }
}

// Initialize
onMounted(() => {
  if (userStore.currentUser) {
    profileForm.value.displayName = userStore.currentUser.displayName || ''
  }
})
</script>