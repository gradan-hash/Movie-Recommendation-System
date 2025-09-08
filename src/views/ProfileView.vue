<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
    <!-- Loading State -->
    <div v-if="userStore.authLoading" class="flex justify-center py-20">
      <LoadingSpinner size="large" text="Loading profile..." />
    </div>

    <!-- Profile Content -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <!-- Mobile Layout -->
        <div class="block sm:hidden">
          <!-- Avatar and Basic Info -->
          <div class="flex items-center gap-4 mb-4">
            <div class="relative">
              <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-lg font-bold text-white">
                {{ userStore.userInitials }}
              </div>
              <button class="absolute -bottom-1 -right-1 bg-gray-700 rounded-full p-1.5 hover:bg-gray-600 transition-colors">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8-3-3-8 8v3z"></path>
                </svg>
              </button>
            </div>
            <div class="flex-1">
              <h1 class="text-xl font-bold text-white mb-1 truncate">{{ userStore.userDisplayName }}</h1>
              <p class="text-gray-400 text-sm truncate">{{ userStore.currentUser?.email }}</p>
            </div>
          </div>

          <!-- Stats Row Mobile -->
          <div class="flex items-center justify-between text-xs text-gray-400 mb-4">
            <span>{{ userStore.likedMoviesCount }} movies</span>
            <span v-if="userStore.currentUser?.emailVerified" class="flex items-center gap-1 text-green-400">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Verified
            </span>
            <span v-else class="flex items-center gap-1 text-yellow-400">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              Unverified
            </span>
          </div>

          <!-- Actions Row Mobile -->
          <div class="flex gap-2">
            <button 
              @click="showEditProfile = true"
              class="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Edit Profile
            </button>
            <button 
              @click="userStore.exportUserData()"
              class="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Export Data
            </button>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden sm:flex items-center gap-6">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-20 h-20 lg:w-24 lg:h-24 bg-red-500 rounded-full flex items-center justify-center text-xl lg:text-2xl font-bold text-white">
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
            <h1 class="text-2xl lg:text-3xl font-bold text-white mb-2">{{ userStore.userDisplayName }}</h1>
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
              class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Edit Profile
            </button>
            <button 
              @click="userStore.exportUserData()"
              class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-gray-800 rounded-lg p-4 sm:p-6 text-center">
          <div class="text-2xl sm:text-3xl font-bold text-red-400 mb-1 sm:mb-2">{{ userStore.likedMoviesCount }}</div>
          <div class="text-gray-400 text-sm sm:text-base">Movies Liked</div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-4 sm:p-6 text-center">
          <div class="text-2xl sm:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">
            {{ userStore.canGetRecommendations ? 'Available' : 'Locked' }}
          </div>
          <div class="text-gray-400 text-sm sm:text-base">AI Recommendations</div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-4 sm:p-6 text-center sm:col-span-2 md:col-span-1">
          <div class="text-2xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">
            {{ movieStats?.averageRating || 0 }}⭐
          </div>
          <div class="text-gray-400 text-sm sm:text-base">Average Rating</div>
        </div>
      </div>

      <!-- Movie Statistics -->
      <div v-if="movieStats" class="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 class="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Your Movie Preferences</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <!-- Favorite Genres -->
          <div>
            <h3 class="text-white font-semibold mb-3 text-sm sm:text-base">Top Genres</h3>
            <div class="space-y-2">
              <div v-for="[genreId, count] in movieStats.favoriteGenres" :key="genreId" class="flex justify-between items-center text-sm">
                <span class="text-gray-300">Genre {{ genreId }}</span>
                <span class="text-red-400 font-semibold">{{ count }} movies</span>
              </div>
            </div>
          </div>

          <!-- Favorite Years -->
          <div>
            <h3 class="text-white font-semibold mb-3 text-sm sm:text-base">Favorite Years</h3>
            <div class="space-y-2">
              <div v-for="[year, count] in movieStats.favoriteYears" :key="year" class="flex justify-between items-center text-sm">
                <span class="text-gray-300">{{ year }}</span>
                <span class="text-blue-400 font-semibold">{{ count }} movies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liked Movies Section -->
      <div class="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-bold text-white">Your Liked Movies</h2>
          <router-link 
            to="/favorites"
            class="text-red-400 hover:text-red-300 text-xs sm:text-sm font-semibold"
          >
            View All →
          </router-link>
        </div>

        <!-- Movies Grid Preview -->
        <div v-if="userStore.hasLikedMovies" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
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
              <div class="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-1 sm:p-2">
                <h3 class="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">{{ movie.title }}</h3>
                <div class="flex items-center justify-center gap-1 text-yellow-400 text-xs">
                  <span>⭐</span>
                  <span>{{ movie.vote_average.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8 sm:py-12">
          <div class="text-4xl sm:text-6xl mb-3 sm:mb-4">❤️</div>
          <h3 class="text-lg sm:text-xl font-bold text-white mb-2">No liked movies yet</h3>
          <p class="text-gray-400 mb-4 text-sm sm:text-base">Start exploring and like movies to build your profile</p>
          <router-link 
            to="/"
            class="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Explore Movies
          </router-link>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div 
      v-if="showEditProfile"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4"
      @click="showEditProfile = false"
    >
      <div 
        class="bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6 mx-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-bold text-white">Edit Profile</h2>
          <button
            @click="showEditProfile = false"
            class="text-gray-400 hover:text-white text-xl sm:text-2xl"
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
              class="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm sm:text-base"
              placeholder="Enter your display name"
            />
          </div>

          <div class="flex gap-2 sm:gap-3">
            <button
              type="submit"
              :disabled="profileLoading"
              class="flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {{ profileLoading ? 'Updating...' : 'Update Profile' }}
            </button>
            <button
              type="button"
              @click="showEditProfile = false"
              class="px-4 sm:px-6 bg-gray-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
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