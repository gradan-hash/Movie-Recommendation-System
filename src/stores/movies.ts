import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tmdbService } from '@/services/tmdb'
import type { Movie, MovieDetails } from '@/types/movie'

export const useMoviesStore = defineStore('movies', () => {
  // State
  const popularMovies = ref<Movie[]>([])
  const searchResults = ref<Movie[]>([])
  const movieDetails = ref<MovieDetails | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalResults = ref(0)
  const searchQuery = ref('')
  
  // Loading states
  const loading = ref(false)
  const loadingMore = ref(false)
  const loadingDetails = ref(false)
  const error = ref<string | null>(null)

  // Cache for movie details
  const detailsCache = ref<Map<number, MovieDetails>>(new Map())

  // Computed
  const hasPopularMovies = computed(() => popularMovies.value.length > 0)
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const canLoadMore = computed(() => currentPage.value < totalPages.value)
  const isSearching = computed(() => searchQuery.value.trim().length > 0)

  // Actions
  const loadPopularMovies = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        loading.value = true
        popularMovies.value = []
      } else {
        loadingMore.value = true
      }
      
      error.value = null
      
      const response = await tmdbService.getPopularMovies(page)
      
      if (append) {
        popularMovies.value.push(...response.results)
      } else {
        popularMovies.value = response.results
      }
      
      currentPage.value = response.page
      totalPages.value = response.total_pages
      totalResults.value = response.total_results
      
    } catch (err: any) {
      error.value = err.message || 'Failed to load popular movies'
      console.error('Error loading popular movies:', err)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const searchMovies = async (query: string, page: number = 1, append: boolean = false) => {
    if (!query.trim()) {
      clearSearchResults()
      return
    }

    try {
      if (!append) {
        loading.value = true
        searchResults.value = []
      } else {
        loadingMore.value = true
      }
      
      error.value = null
      searchQuery.value = query
      
      const response = await tmdbService.searchMovies(query, page)
      
      if (append) {
        searchResults.value.push(...response.results)
      } else {
        searchResults.value = response.results
      }
      
      currentPage.value = response.page
      totalPages.value = response.total_pages
      totalResults.value = response.total_results
      
    } catch (err: any) {
      error.value = err.message || 'Failed to search movies'
      console.error('Error searching movies:', err)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const loadMovieDetails = async (movieId: number): Promise<MovieDetails | null> => {
    // Check cache first
    if (detailsCache.value.has(movieId)) {
      const cached = detailsCache.value.get(movieId)!
      movieDetails.value = cached
      return cached
    }

    try {
      loadingDetails.value = true
      error.value = null
      
      const details = await tmdbService.getMovieDetails(movieId)
      
      // Cache the details
      detailsCache.value.set(movieId, details)
      movieDetails.value = details
      
      return details
      
    } catch (err: any) {
      error.value = err.message || 'Failed to load movie details'
      console.error('Error loading movie details:', err)
      return null
    } finally {
      loadingDetails.value = false
    }
  }

  const loadMoreMovies = async () => {
    if (!canLoadMore.value || loadingMore.value) return

    const nextPage = currentPage.value + 1
    
    if (isSearching.value) {
      await searchMovies(searchQuery.value, nextPage, true)
    } else {
      await loadPopularMovies(nextPage, true)
    }
  }

  const clearSearchResults = () => {
    searchResults.value = []
    searchQuery.value = ''
    currentPage.value = 1
    totalPages.value = 1
    totalResults.value = 0
  }

  const clearError = () => {
    error.value = null
  }

  const getCurrentMovies = computed(() => {
    return isSearching.value ? searchResults.value : popularMovies.value
  })

  // Utility actions
  const findMovieById = (movieId: number): Movie | undefined => {
    const allMovies = [...popularMovies.value, ...searchResults.value]
    return allMovies.find(movie => movie.id === movieId)
  }

  const refreshData = async () => {
    if (isSearching.value) {
      await searchMovies(searchQuery.value)
    } else {
      await loadPopularMovies()
    }
  }

  return {
    // State
    popularMovies,
    searchResults,
    movieDetails,
    currentPage,
    totalPages,
    totalResults,
    searchQuery,
    loading,
    loadingMore,
    loadingDetails,
    error,
    
    // Computed
    hasPopularMovies,
    hasSearchResults,
    canLoadMore,
    isSearching,
    getCurrentMovies,
    
    // Actions
    loadPopularMovies,
    searchMovies,
    loadMovieDetails,
    loadMoreMovies,
    clearSearchResults,
    clearError,
    findMovieById,
    refreshData
  }
})