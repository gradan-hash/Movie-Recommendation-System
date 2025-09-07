<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white">
    <!-- Header Navigation -->
    <header class="bg-gradient-to-r from-red-600 to-red-700 p-4 shadow-2xl sticky top-0 z-40">
      <div class="container mx-auto">
        <nav class="flex items-center justify-between">
          <!-- Logo -->
          <router-link 
            to="/" 
            class="text-2xl font-bold flex items-center gap-2 hover:text-yellow-300 transition-colors"
          >
            🎬 <span class="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">CinemaAI</span>
          </router-link>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-6">
            <router-link 
              to="/" 
              class="text-red-100 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              Home
            </router-link>
            <router-link 
              to="/search" 
              class="text-red-100 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              Search
            </router-link>
            <router-link 
              v-if="userStore.isAuthenticated"
              to="/favorites" 
              class="text-red-100 hover:text-white transition-colors flex items-center gap-1"
              active-class="text-white font-semibold"
            >
              ❤️ Favorites
              <span v-if="userStore.likedMoviesCount" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {{ userStore.likedMoviesCount }}
              </span>
            </router-link>
            <router-link 
              v-if="userStore.isAuthenticated && userStore.canGetRecommendations"
              to="/recommendations" 
              class="text-red-100 hover:text-white transition-colors flex items-center gap-1"
              active-class="text-white font-semibold"
            >
              🤖 AI Recommendations
              <span class="bg-purple-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                New
              </span>
            </router-link>

            <!-- Authentication UI -->
            <div v-if="userStore.isAuthenticated" class="flex items-center gap-3">
              <!-- User Profile Button -->
              <router-link 
                to="/profile"
                class="flex items-center gap-2 text-red-100 hover:text-white transition-colors"
                active-class="text-white font-semibold"
              >
                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  {{ userStore.userInitials }}
                </div>
                <span class="hidden lg:inline">{{ userStore.userDisplayName }}</span>
              </router-link>

              <!-- Logout Button -->
              <button
                @click="handleLogout"
                class="text-red-100 hover:text-white transition-colors text-sm"
                :disabled="loggingOut"
              >
                {{ loggingOut ? 'Signing out...' : 'Sign Out' }}
              </button>
            </div>

            <!-- Login/Register Buttons -->
            <div v-else class="flex items-center gap-3">
              <button
                @click="openAuthModal('login')"
                class="text-red-100 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                @click="openAuthModal('register')"
                class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden text-white p-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </nav>

        <!-- Mobile Menu -->
        <div v-if="showMobileMenu" class="md:hidden mt-4 pb-4 border-t border-red-500">
          <div class="flex flex-col gap-3 mt-4">
            <router-link 
              to="/" 
              @click="closeMobileMenu"
              class="text-red-100 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              🏠 Home
            </router-link>
            <router-link 
              to="/search" 
              @click="closeMobileMenu"
              class="text-red-100 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              🔍 Search
            </router-link>
            
            <!-- Authenticated Mobile Menu -->
            <template v-if="userStore.isAuthenticated">
              <router-link 
                to="/favorites" 
                @click="closeMobileMenu"
                class="text-red-100 hover:text-white transition-colors flex items-center gap-2"
                active-class="text-white font-semibold"
              >
                ❤️ Favorites
                <span v-if="userStore.likedMoviesCount" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {{ userStore.likedMoviesCount }}
                </span>
              </router-link>
              <router-link 
                v-if="userStore.canGetRecommendations"
                to="/recommendations" 
                @click="closeMobileMenu"
                class="text-red-100 hover:text-white transition-colors"
                active-class="text-white font-semibold"
              >
                🤖 AI Recommendations
              </router-link>
              <router-link 
                to="/profile" 
                @click="closeMobileMenu"
                class="text-red-100 hover:text-white transition-colors flex items-center gap-2"
                active-class="text-white font-semibold"
              >
                <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold">
                  {{ userStore.userInitials }}
                </div>
                👤 {{ userStore.userDisplayName }}
              </router-link>
              <button
                @click="handleLogout"
                class="text-left text-red-100 hover:text-white transition-colors"
                :disabled="loggingOut"
              >
                🚪 {{ loggingOut ? 'Signing out...' : 'Sign Out' }}
              </button>
            </template>

            <!-- Guest Mobile Menu -->
            <template v-else>
              <button
                @click="openAuthModal('login')"
                class="text-left text-red-100 hover:text-white transition-colors"
              >
                🔐 Sign In
              </button>
              <button
                @click="openAuthModal('register')"
                class="text-left bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                📝 Sign Up
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Router View -->
    <main>
      <router-view />
    </main>

    <!-- Footer redo footer show about us contact infor etc and etc  -->
    <footer class="bg-gray-800 p-6 mt-12 text-center">
      <div class="text-gray-400 mb-2">
        Built with Vue 3, TypeScript, Tailwind CSS & TMDB API
      </div>
      <div class="text-sm text-gray-500">
        Professional Vue Router Architecture ✨
      </div>
    </footer>

    <!-- Authentication Modal -->
    <AuthModal 
      :is-open="userStore.showAuthModal"
      :initial-mode="userStore.authModalMode"
      @close="userStore.closeAuthModal"
      @success="onAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import AuthModal from '@/components/AuthModal.vue'

// Store
const userStore = useUserStore()

// State
const showMobileMenu = ref(false)
const loggingOut = ref(false)

// Methods
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const openAuthModal = (mode: 'login' | 'register') => {
  userStore.openAuthModal(mode)
  closeMobileMenu()
}

const handleLogout = async () => {
  loggingOut.value = true
  closeMobileMenu()
  
  try {
    await userStore.logout()
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    loggingOut.value = false
  }
}

const onAuthSuccess = (type: 'login' | 'register' | 'reset') => {
  console.log(`Authentication success: ${type}`)
}

// Initialize user store
onMounted(() => {
  userStore.initializeAuth()
  userStore.loadFromLocalStorage()
})
</script>

<style scoped>
/* Router link transitions */
.router-link-active {
  position: relative;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 1px;
}

/* Smooth animations */
.transition-colors {
  transition: color 0.2s ease;
}

/* Background gradient animation */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>

