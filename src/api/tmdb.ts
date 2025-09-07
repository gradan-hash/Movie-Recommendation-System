import axios, { type AxiosResponse } from 'axios'
import type { 
  Movie, 
  MovieDetails, 
  SearchMoviesResponse, 
  PopularMoviesResponse 
} from '@/types/movie'

// TMDB API Response types
export interface TMDBApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  status?: number
}

// API Configuration
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_API_Read_Access_Token

// Create axios instance with proper configuration
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
tmdbApi.interceptors.request.use((config) => {
  if (TMDB_ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${TMDB_ACCESS_TOKEN}`
  } else if (TMDB_API_KEY) {
    config.params = { ...config.params, api_key: TMDB_API_KEY }
  }
  
  console.log(`📡 TMDB API: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Response interceptor for error handling
tmdbApi.interceptors.response.use(
  (response) => {
    console.log(`✅ TMDB API: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ TMDB API: ${error.response?.status || 'Network'} ${error.config?.url}`, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// TMDB API endpoints
export class TMDBAPI {
  
  /**
   * Get popular movies endpoint
   */
  static async getPopularMovies(page: number = 1): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    try {
      console.log(`🔥 API: Fetching popular movies - page ${page}`)
      
      const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get('/movie/popular', {
        params: { page }
      })
      
      console.log(`✅ API: Popular movies fetched - ${response.data.results.length} movies, total: ${response.data.total_results}`)
      
      return {
        success: true,
        data: response.data,
        status: response.status
      }
      
    } catch (error: any) {
      console.error('❌ API: Popular movies failed:', error.response?.data || error.message)
      
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status
      }
    }
  }

  /**
   * Search movies endpoint
   */
  static async searchMovies(query: string, page: number = 1): Promise<TMDBApiResponse<SearchMoviesResponse>> {
    try {
      if (!query.trim()) {
        return {
          success: true,
          data: { page: 1, results: [], total_pages: 0, total_results: 0 }
        }
      }

      console.log(`🔍 API: Searching movies - query: "${query}", page: ${page}`)
      
      const response: AxiosResponse<SearchMoviesResponse> = await tmdbApi.get('/search/movie', {
        params: { 
          query: encodeURIComponent(query),
          page 
        }
      })
      
      console.log(`✅ API: Search completed - ${response.data.results.length} results, total: ${response.data.total_results}`)
      
      return {
        success: true,
        data: response.data,
        status: response.status
      }
      
    } catch (error: any) {
      console.error('❌ API: Search movies failed:', error.response?.data || error.message)
      
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status
      }
    }
  }

  /**
   * Get movie details endpoint
   */
  static async getMovieDetails(movieId: number): Promise<TMDBApiResponse<MovieDetails>> {
    try {
      console.log(`🎬 API: Fetching movie details - ID: ${movieId}`)
      
      const response: AxiosResponse<MovieDetails> = await tmdbApi.get(`/movie/${movieId}`)
      
      console.log(`✅ API: Movie details fetched - "${response.data.title}"`)
      
      return {
        success: true,
        data: response.data,
        status: response.status
      }
      
    } catch (error: any) {
      console.error('❌ API: Movie details failed:', error.response?.data || error.message)
      
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status
      }
    }
  }

  /**
   * Get movie by exact title endpoint
   */
  static async getMovieByTitle(title: string): Promise<TMDBApiResponse<Movie | null>> {
    try {
      console.log(`🎯 API: Finding movie by title - "${title}"`)
      
      const searchResponse = await this.searchMovies(title, 1)
      
      if (!searchResponse.success || !searchResponse.data) {
        return {
          success: true,
          data: null
        }
      }
      
      // Find exact match (case insensitive)
      const exactMatch = searchResponse.data.results.find(
        (movie: Movie) => movie.title.toLowerCase() === title.toLowerCase()
      )
      
      const result = exactMatch || searchResponse.data.results[0] || null
      
      if (result) {
        console.log(`✅ API: Movie found by title - "${result.title}"`)
      } else {
        console.log(`ℹ️ API: No movie found for title - "${title}"`)
      }
      
      return {
        success: true,
        data: result
      }
      
    } catch (error: any) {
      console.error('❌ API: Find movie by title failed:', error.message)
      
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  }

  /**
   * Get trending movies endpoint
   */
  static async getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    try {
      console.log(`📈 API: Fetching trending movies - ${timeWindow}`)
      
      const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get(`/trending/movie/${timeWindow}`)
      
      console.log(`✅ API: Trending movies fetched - ${response.data.results.length} movies`)
      
      return {
        success: true,
        data: response.data,
        status: response.status
      }
      
    } catch (error: any) {
      console.error('❌ API: Trending movies failed:', error.response?.data || error.message)
      
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status
      }
    }
  }

  /**
   * Get top rated movies endpoint
   */
  static async getTopRatedMovies(page: number = 1): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    try {
      console.log(`⭐ API: Fetching top rated movies - page ${page}`)
      
      const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get('/movie/top_rated', {
        params: { page }
      })
      
      console.log(`✅ API: Top rated movies fetched - ${response.data.results.length} movies`)
      
      return {
        success: true,
        data: response.data,
        status: response.status
      }
      
    } catch (error: any) {
      console.error('❌ API: Top rated movies failed:', error.response?.data || error.message)
      
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status
      }
    }
  }

  /**
   * Test TMDB API configuration
   */
  static async testConfiguration(): Promise<TMDBApiResponse<any>> {
    try {
      console.log('🔧 API: Testing TMDB configuration')
      
      // Test with a simple API call
      const response = await tmdbApi.get('/configuration')
      
      console.log('✅ API: TMDB configuration test successful')
      
      return {
        success: true,
        data: {
          message: 'TMDB API configuration is working',
          baseUrl: TMDB_BASE_URL,
          hasApiKey: !!TMDB_API_KEY,
          hasAccessToken: !!TMDB_ACCESS_TOKEN
        },
        status: response.status
      }
      
    } catch (error: any) {
      console.error('❌ API: TMDB configuration test failed:', error.response?.data || error.message)
      
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status
      }
    }
  }

  /**
   * Get configuration errors for debugging
   */
  static getConfigurationStatus(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!TMDB_BASE_URL) {
      errors.push('Missing TMDB_BASE_URL')
    }
    
    if (!TMDB_API_KEY && !TMDB_ACCESS_TOKEN) {
      errors.push('Missing both TMDB_API_KEY and TMDB_ACCESS_TOKEN')
    }
    
    if (TMDB_API_KEY && !TMDB_ACCESS_TOKEN) {
      warnings.push('Using API key instead of access token (less secure)')
    }
    
    console.log('🔧 API: TMDB configuration status:', {
      isValid: errors.length === 0,
      errors,
      warnings,
      baseUrl: TMDB_BASE_URL,
      hasApiKey: !!TMDB_API_KEY,
      hasAccessToken: !!TMDB_ACCESS_TOKEN
    })
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Convert API errors to user-friendly messages
   */
  private static getErrorMessage(error: any): string {
    if (error.response?.data?.status_message) {
      return error.response.data.status_message
    }
    
    if (error.response?.status) {
      const statusMessages: Record<number, string> = {
        400: 'Bad request - please check your search parameters',
        401: 'Unauthorized - invalid API key or token',
        404: 'Not found - the requested resource does not exist',
        429: 'Rate limit exceeded - please try again later',
        500: 'Server error - please try again later',
        503: 'Service unavailable - please try again later'
      }
      
      return statusMessages[error.response.status] || `HTTP ${error.response.status}: ${error.response.statusText}`
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ENETUNREACH') {
      return 'Network error - please check your internet connection'
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout - please try again'
    }
    
    return error.message || 'An unknown error occurred'
  }
}

// Export convenience functions
export const getPopularMovies = TMDBAPI.getPopularMovies
export const searchMovies = TMDBAPI.searchMovies
export const getMovieDetails = TMDBAPI.getMovieDetails
export const getMovieByTitle = TMDBAPI.getMovieByTitle
export const getTrendingMovies = TMDBAPI.getTrendingMovies
export const getTopRatedMovies = TMDBAPI.getTopRatedMovies
export const testTMDBConfig = TMDBAPI.testConfiguration
export const getTMDBConfigStatus = TMDBAPI.getConfigurationStatus

// Utility functions
export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return 'https://via.placeholder.com/300x450/374151/9CA3AF?text=No+Image'
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export const getBackdropUrl = (path: string | null, size: string = 'w1280'): string => {
  if (!path) return 'https://via.placeholder.com/1280x720/374151/9CA3AF?text=No+Backdrop'
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export const formatReleaseDate = (dateString: string): string => {
  try {
    return new Date(dateString).getFullYear().toString()
  } catch {
    return 'Unknown'
  }
}