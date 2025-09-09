import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TMDBAPI, type TMDBApiResponse } from '@/api/tmdb'
import type {
  Movie,
  MovieDetails,
  PopularMoviesResponse,
  SearchMoviesResponse,
} from '@/types/movie'

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

  // Actions using API endpoints
  const loadPopularMovies = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        loading.value = true
        popularMovies.value = []
      } else {
        loadingMore.value = true
      }

      error.value = null

      const response: TMDBApiResponse<PopularMoviesResponse> = await TMDBAPI.getPopularMovies(page)

      if (response.success && response.data) {
        if (append) {
          popularMovies.value.push(...response.data.results)
        } else {
          popularMovies.value = response.data.results
        }

        currentPage.value = response.data.page
        totalPages.value = response.data.total_pages
        totalResults.value = response.data.total_results
      } else {
        error.value = response.error || 'Failed to load popular movies'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load popular movies'
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

      const response: TMDBApiResponse<SearchMoviesResponse> = await TMDBAPI.searchMovies(
        query,
        page
      )

      if (response.success && response.data) {
        if (append) {
          searchResults.value.push(...response.data.results)
        } else {
          searchResults.value = response.data.results
        }

        currentPage.value = response.data.page
        totalPages.value = response.data.total_pages
        totalResults.value = response.data.total_results
      } else {
        error.value = response.error || 'Failed to search movies'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to search movies'
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

      const response = await TMDBAPI.getMovieDetails(movieId)

      if (response.success && response.data) {
        // Cache the details
        detailsCache.value.set(movieId, response.data)
        movieDetails.value = response.data

        return response.data
      } else {
        error.value = response.error || 'Failed to load movie details'
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load movie details'
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
    refreshData,
  }
})
