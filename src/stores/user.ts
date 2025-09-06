import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Movie } from '@/types/movie'

export const useUserStore = defineStore('user', () => {
  // State
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

  // Actions
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
    // State
    likedMovies,
    preferences,
    
    // Computed
    likedMovieIds,
    likedMoviesCount,
    hasLikedMovies,
    canGetRecommendations,
    getMovieStats,
    
    // Actions
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