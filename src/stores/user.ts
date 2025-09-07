import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Movie } from '@/types/movie'
import { AuthAPI, type AuthResponse } from '@/api/auth'
import { authService, type User } from '@/services/auth'

export const useUserStore = defineStore('user', () => {
  // Authentication State
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const authLoading = ref(true)

  // Auth Modal State
  const showAuthModal = ref(false)
  const authModalMode = ref<'login' | 'register'>('login')

  // Movie Preferences State
  const likedMovies = ref<Movie[]>([])
  const preferences = ref({
    darkMode: true,
    autoPlay: false,
    showAdultContent: false,
    preferredLanguage: 'en'
  })

  // Computed
  const likedMovieIds = computed(() => 
    likedMovies.value.map(movie => movie.id)
  )

  const likedMoviesCount = computed(() => likedMovies.value.length)

  const hasLikedMovies = computed(() => likedMovies.value.length > 0)

  const canGetRecommendations = computed(() => likedMovies.value.length >= 3)

  // Authentication Computed
  const userDisplayName = computed(() => currentUser.value?.displayName || currentUser.value?.email || 'User')
  const userInitials = computed(() => {
    const name = userDisplayName.value
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  })

  // Auth Modal Actions
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    authModalMode.value = mode
    showAuthModal.value = true
    console.log(`🔐 Store: Auth modal opened in ${mode} mode`)
  }

  const closeAuthModal = () => {
    showAuthModal.value = false
    console.log('🔐 Store: Auth modal closed')
  }

  // Authentication Actions using API endpoints
  const login = async (email: string, password: string) => {
    authLoading.value = true
    try {
      console.log('🔐 Store: Attempting login via API endpoint')
      
      const response: AuthResponse = await AuthAPI.login({ email, password })
      
      if (response.success && response.data) {
        console.log('✅ Store: Login API response successful')
        
        // Map API response to User type
        const user: User = {
          uid: response.data.uid,
          email: response.data.email,
          displayName: response.data.displayName,
          photoURL: null,
          emailVerified: response.data.emailVerified
        }
        
        currentUser.value = user
        isAuthenticated.value = true
        await loadFromLocalStorage()
        
        return user
      } else {
        console.error('❌ Store: Login API failed:', response.error)
        throw new Error(response.error || 'Login failed')
      }
    } catch (error: any) {
      console.error('❌ Store: Login error:', error.message)
      throw error
    } finally {
      authLoading.value = false
    }
  }

  const register = async (email: string, password: string, displayName?: string) => {
    authLoading.value = true
    try {
      console.log('📝 Store: Attempting registration via API endpoint')
      
      const response: AuthResponse = await AuthAPI.register({ 
        email, 
        password, 
        displayName 
      })
      
      if (response.success && response.data) {
        console.log('✅ Store: Registration API response successful')
        
        // Map API response to User type
        const user: User = {
          uid: response.data.uid,
          email: response.data.email,
          displayName: response.data.displayName,
          photoURL: null,
          emailVerified: response.data.emailVerified
        }
        
        currentUser.value = user
        isAuthenticated.value = true
        
        return user
      } else {
        console.error('❌ Store: Registration API failed:', response.error)
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error: any) {
      console.error('❌ Store: Registration error:', error.message)
      throw error
    } finally {
      authLoading.value = false
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Store: Attempting logout via API endpoint')
      
      const response: AuthResponse = await AuthAPI.logout()
      
      if (response.success) {
        console.log('✅ Store: Logout API response successful')
        
        currentUser.value = null
        isAuthenticated.value = false
        clearUserData()
      } else {
        console.error('❌ Store: Logout API failed:', response.error)
        throw new Error(response.error || 'Logout failed')
      }
    } catch (error: any) {
      console.error('❌ Store: Logout error:', error.message)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Store: Attempting password reset via API endpoint')
      
      const response: AuthResponse = await AuthAPI.resetPassword({ email })
      
      if (response.success) {
        console.log('✅ Store: Password reset API response successful')
      } else {
        console.error('❌ Store: Password reset API failed:', response.error)
        throw new Error(response.error || 'Password reset failed')
      }
    } catch (error: any) {
      console.error('❌ Store: Password reset error:', error.message)
      throw error
    }
  }

  const updateProfile = async (displayName?: string, photoURL?: string) => {
    try {
      console.log('👤 Store: Attempting profile update via API endpoint')
      
      const response: AuthResponse = await AuthAPI.updateProfile(displayName, photoURL)
      
      if (response.success && response.data) {
        console.log('✅ Store: Profile update API response successful')
        
        // Update local user state
        if (currentUser.value) {
          currentUser.value.displayName = response.data.displayName
          currentUser.value.photoURL = photoURL || currentUser.value.photoURL
        }
      } else {
        console.error('❌ Store: Profile update API failed:', response.error)
        throw new Error(response.error || 'Profile update failed')
      }
    } catch (error: any) {
      console.error('❌ Store: Profile update error:', error.message)
      throw error
    }
  }

  const clearUserData = () => {
    likedMovies.value = []
    preferences.value = {
      darkMode: true,
      autoPlay: false,
      showAdultContent: false,
      preferredLanguage: 'en'
    }
    // Clear localStorage
    localStorage.removeItem('cinemaai-user-data')
  }

  // Initialize authentication state
  const initializeAuth = () => {
    console.log('🔧 Store: Initializing auth state')
    
    // Check Firebase configuration first
    const configCheck = AuthAPI.checkConfiguration()
    if (!configCheck.isValid) {
      console.error('❌ Store: Firebase configuration invalid:', configCheck.errors)
      authLoading.value = false
      return
    }
    
    console.log('✅ Store: Firebase configuration valid')
    
    // Set up auth state listener
    authService.onAuthStateChange((user) => {
      console.log('🔄 Store: Auth state changed:', user ? `User: ${user.uid}` : 'No user')
      
      currentUser.value = user
      isAuthenticated.value = !!user
      authLoading.value = false
      
      if (user) {
        loadFromLocalStorage()
      } else {
        clearUserData()
      }
    })

    // Check current user via API
    const currentUserResponse = AuthAPI.getCurrentUser()
    if (currentUserResponse.success && currentUserResponse.data) {
      console.log('✅ Store: Found current user via API:', currentUserResponse.data.uid)
      
      const user: User = {
        uid: currentUserResponse.data.uid,
        email: currentUserResponse.data.email,
        displayName: currentUserResponse.data.displayName,
        photoURL: null,
        emailVerified: currentUserResponse.data.emailVerified
      }
      
      currentUser.value = user
      isAuthenticated.value = true
    } else {
      console.log('ℹ️ Store: No current user found')
    }
    
    authLoading.value = false
  }

  // Movie Actions
  const likeMovie = (movie: Movie) => {
    const exists = likedMovies.value.find(liked => liked.id === movie.id)
    if (!exists) {
      likedMovies.value.push(movie)
      saveToLocalStorage()
      console.log(`❤️ Liked: ${movie.title}`)
    }
  }

  const unlikeMovie = (movieId: number) => {
    const index = likedMovies.value.findIndex(movie => movie.id === movieId)
    if (index > -1) {
      const removedMovie = likedMovies.value.splice(index, 1)[0]
      saveToLocalStorage()
      console.log(`💔 Unliked: ${removedMovie.title}`)
    }
  }

  const toggleLike = (movie: Movie) => {
    const isLiked = likedMovieIds.value.includes(movie.id)
    if (isLiked) {
      unlikeMovie(movie.id)
    } else {
      likeMovie(movie)
    }
  }

  const isMovieLiked = (movieId: number): boolean => {
    return likedMovieIds.value.includes(movieId)
  }

  const clearLikedMovies = () => {
    likedMovies.value = []
    saveToLocalStorage()
    console.log('🧹 Cleared all liked movies')
  }

  // Preferences actions
  const updatePreferences = (newPreferences: Partial<typeof preferences.value>) => {
    preferences.value = { ...preferences.value, ...newPreferences }
    saveToLocalStorage()
  }

  const toggleDarkMode = () => {
    preferences.value.darkMode = !preferences.value.darkMode
    saveToLocalStorage()
  }

  // Persistence
  const saveToLocalStorage = () => {
    try {
      const userData = {
        likedMovies: likedMovies.value,
        preferences: preferences.value,
        timestamp: Date.now()
      }
      localStorage.setItem('cinemaai-user-data', JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('cinemaai-user-data')
      if (saved) {
        const userData = JSON.parse(saved)
        
        // Restore liked movies
        if (userData.likedMovies && Array.isArray(userData.likedMovies)) {
          likedMovies.value = userData.likedMovies
        }
        
        // Restore preferences
        if (userData.preferences) {
          preferences.value = { ...preferences.value, ...userData.preferences }
        }
        
        console.log(`📱 Restored ${likedMovies.value.length} liked movies from storage`)
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }

  const exportUserData = () => {
    const userData = {
      likedMovies: likedMovies.value,
      preferences: preferences.value,
      exportDate: new Date().toISOString(),
      totalLikedMovies: likedMoviesCount.value
    }
    
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'cinemaai-my-movies.json'
    link.click()
    
    URL.revokeObjectURL(url)
    console.log('📥 User data exported')
  }

  // Statistics
  const getMovieStats = computed(() => {
    if (!hasLikedMovies.value) return null

    const genres = new Map<number, number>()
    const years = new Map<string, number>()
    let totalRating = 0

    likedMovies.value.forEach(movie => {
      // Count genres
      movie.genre_ids.forEach(genreId => {
        genres.set(genreId, (genres.get(genreId) || 0) + 1)
      })

      // Count years
      const year = movie.release_date.split('-')[0]
      years.set(year, (years.get(year) || 0) + 1)

      // Sum ratings
      totalRating += movie.vote_average
    })

    return {
      totalMovies: likedMoviesCount.value,
      averageRating: Number((totalRating / likedMoviesCount.value).toFixed(1)),
      favoriteGenres: Array.from(genres.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      favoriteYears: Array.from(years.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    }
  })

  return {
    // Authentication State
    currentUser,
    isAuthenticated,
    authLoading,
    
    // Auth Modal State
    showAuthModal,
    authModalMode,
    
    // Movie State
    likedMovies,
    preferences,
    
    // Authentication Computed
    userDisplayName,
    userInitials,
    
    // Movie Computed
    likedMovieIds,
    likedMoviesCount,
    hasLikedMovies,
    canGetRecommendations,
    getMovieStats,
    
    // Auth Modal Actions
    openAuthModal,
    closeAuthModal,
    
    // Authentication Actions
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    initializeAuth,
    
    // Movie Actions
    likeMovie,
    unlikeMovie,
    toggleLike,
    isMovieLiked,
    clearLikedMovies,
    updatePreferences,
    toggleDarkMode,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportUserData
  }
})