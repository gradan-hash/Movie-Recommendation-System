<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white">
    <!-- Header Navigation -->
    <header class="bg-gradient-to-r from-red-600 to-red-700 p-4 shadow-2xl sticky top-0 z-40">
      <div class="container mx-auto">
        <nav class="flex items-center justify-between gap-4">
          <!-- Logo -->
          <router-link
            to="/"
            class="text-2xl font-bold flex items-center gap-2 hover:text-yellow-300 transition-colors flex-shrink-0"
          >
            <font-awesome-icon icon="film" />
            <span
              class="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent"
              >CinemaAI</span
            >
          </router-link>

          <!-- Search Bar - Hidden on mobile (shown in mobile menu), visible on desktop -->
          <div class="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar
              :is-searching="searchLoading"
              :total-results="searchResults"
              placeholder="Search movies..."
              :show-stats="false"
              @search="onNavbarSearch"
              @clear="onNavbarSearchClear"
            />
          </div>

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
              v-if="userStore.isAuthenticated && userStore.canGetRecommendations"
              to="/recommendations"
              class="text-red-100 hover:text-white transition-colors flex items-center gap-1"
              active-class="text-white font-semibold"
            >
              AI Recommendations
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
                <div
                  class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-semibold"
                >
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
            ref="mobileMenuButtonRef"
            @click="toggleMobileMenu"
            class="md:hidden text-white p-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </nav>

        <!-- Mobile Menu -->
        <div
          v-if="showMobileMenu"
          ref="mobileMenuRef"
          class="md:hidden mt-4 pb-4 border-t border-red-500"
        >
          <!-- Mobile Search Bar -->
          <div class="mt-4 mb-4">
            <SearchBar
              :is-searching="searchLoading"
              :total-results="searchResults"
              placeholder="Search movies..."
              :show-stats="false"
              @search="onNavbarSearch"
              @clear="onNavbarSearchClear"
            />
          </div>

          <div class="flex flex-col gap-3">
            <router-link
              to="/"
              @click="closeMobileMenu"
              class="text-red-100 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              Home
            </router-link>

            <!-- Authenticated Mobile Menu -->
            <template v-if="userStore.isAuthenticated">
              <router-link
                v-if="userStore.canGetRecommendations"
                to="/recommendations"
                @click="closeMobileMenu"
                class="text-red-100 hover:text-white transition-colors"
                active-class="text-white font-semibold"
              >
                AI Recommendations
              </router-link>
              <router-link
                to="/profile"
                @click="closeMobileMenu"
                class="text-red-100 hover:text-white transition-colors flex items-center gap-2"
                active-class="text-white font-semibold"
              >
                <div
                  class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold"
                >
                  {{ userStore.userInitials }}
                </div>
                {{ userStore.userDisplayName }}
              </router-link>
              <button
                @click="handleLogout"
                class="text-left text-red-100 hover:text-white transition-colors"
                :disabled="loggingOut"
              >
                {{ loggingOut ? 'Signing out...' : 'Sign Out' }}
              </button>
            </template>

            <!-- Guest Mobile Menu -->
            <template v-else>
              <button
                @click="openAuthModal('login')"
                class="text-left text-red-100 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                @click="openAuthModal('register')"
                class="text-left bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Up
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Router View with Smooth Transitions -->
    <main class="relative">
      <router-view v-slot="{ Component, route }">
        <PageTransition type="cinema">
          <KeepAlive :include="['HomeView', 'SearchView']" :max="3">
            <component :is="Component" :key="route.path" />
          </KeepAlive>
        </PageTransition>
      </router-view>
    </main>

    <!-- Enhanced Professional Footer -->
    <footer class="bg-gradient-to-b from-gray-800 to-gray-900 text-white mt-16 font-base">
      <div class="container mx-auto px-6 py-12">
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Brand Section -->
          <div class="lg:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-2xl">🎬</span>
              <h3
                class="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent"
              >
                CinemaAI
              </h3>
            </div>
            <p class="text-gray-300 mb-4 leading-relaxed">
              Your intelligent movie companion powered by AI. Discover, explore, and get
              personalized recommendations from the world's largest movie database.
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="bg-red-600/20 text-red-300 px-3 py-1 rounded-full text-sm">Vue 3</span>
              <span class="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                >TypeScript</span
              >
              <span class="bg-cyan-600/20 text-cyan-300 px-3 py-1 rounded-full text-sm"
                >Tailwind</span
              >
              <span class="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm"
                >TMDB API</span
              >
              <span class="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                >Firebase</span
              >
              <span class="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm"
                >AI Powered</span
              >
            </div>
          </div>

          <!-- Quick Links -->
          <div class="hidden md:block">
            <h4 class="text-lg font-semibold mb-4 text-yellow-300">Quick Links</h4>
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/"
                  class="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2"
                >
                  Home
                </router-link>
              </li>
              <li v-if="userStore.isAuthenticated && userStore.canGetRecommendations">
                <router-link
                  to="/recommendations"
                  class="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2"
                >
                  AI Recommendations
                </router-link>
              </li>

              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <!-- Contact & Support -->
          <div class="hidden md:block">
            <h4 class="text-lg font-semibold mb-4 text-yellow-300">Connect</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-gray-300">
                <span class="text-lg"></span>
                <span class="text-sm">info@cinemaai.app</span>
              </div>
              <div class="flex items-center gap-3 text-gray-300">
                <span class="text-lg"></span>
                <span class="text-sm">www.cinemaai.app</span>
              </div>
              <div class="flex items-center gap-3 text-gray-300">
                <span class="text-lg"></span>
                <span class="text-sm">Mobile App Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Authentication Modal -->
    <AuthModal
      :is-open="userStore.showAuthModal"
      :initial-mode="userStore.authModalMode"
      @close="userStore.closeAuthModal"
      @success="onAuthSuccess"
    />

    <!-- Global Loader -->
    <GlobalLoader />

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, KeepAlive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AuthModal from '@/components/AuthModal.vue'
import GlobalLoader from '@/components/GlobalLoader.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import PageTransition from '@/components/PageTransition.vue'
import SearchBar from '@/components/SearchBar.vue'
import { usePerformance } from '@/composables/usePerformance'

// Store and Router
const userStore = useUserStore()
const router = useRouter()

// Performance optimization (automatically initialized)
usePerformance()

// State
const showMobileMenu = ref(false)
const loggingOut = ref(false)
const searchLoading = ref(false)
const searchResults = ref(0)

// Template refs
const mobileMenuRef = ref<HTMLElement>()
const mobileMenuButtonRef = ref<HTMLElement>()

// Methods
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Click outside handler for mobile menu
const handleClickOutside = (event: Event) => {
  if (!showMobileMenu.value) return

  const target = event.target as HTMLElement
  const mobileMenu = mobileMenuRef.value
  const mobileMenuButton = mobileMenuButtonRef.value

  // Don't close if clicking on the menu itself or the button
  if (mobileMenu && mobileMenu.contains(target)) return
  if (mobileMenuButton && mobileMenuButton.contains(target)) return

  // Close the menu if clicking outside
  closeMobileMenu()
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
  } finally {
    loggingOut.value = false
  }
}

const onAuthSuccess = (_type: 'login' | 'register' | 'reset') => {}

// Search functionality - Update homepage instead of navigating
const onNavbarSearch = async (query: string) => {
  searchLoading.value = true

  // Navigate to home if not already there
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }

  // Use a global event to update the homepage with search
  window.dispatchEvent(
    new CustomEvent('homepage-search', {
      detail: { query, loading: true },
    })
  )

  searchLoading.value = false
}

const onNavbarSearchClear = () => {
  searchResults.value = 0

  // Navigate to home if not already there
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }

  // Clear the search on homepage
  window.dispatchEvent(new CustomEvent('homepage-search-clear'))
}

// Initialize user store and performance optimizations
onMounted(async () => {
  // Initialize authentication
  userStore.initializeAuth()
  userStore.loadFromLocalStorage()

  // Note: Performance optimizations and monitoring are automatically initialized
  // by the usePerformance composable's onMounted hook

  // Add click outside listener for mobile menu
  document.addEventListener('click', handleClickOutside)

  // Optimize images for better loading
  setTimeout(() => {
    const images = document.querySelectorAll('img:not([data-src])')
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy')
      }
    })
  }, 100)
})

// Cleanup event listeners
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Router link transitions */

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
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
