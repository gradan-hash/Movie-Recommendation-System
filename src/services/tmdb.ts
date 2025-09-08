import axios from 'axios'
import type {
  Movie,
  MovieDetails,
  SearchMoviesResponse,
  PopularMoviesResponse,
  CacheItem,
  TMDBError,
} from '../types/movie'

export class TMDBService {
  private api: ReturnType<typeof axios.create>
  private cache = new Map<string, CacheItem<unknown>>()
  private readonly CACHE_TTL = 15 * 60 * 1000 // 15 minutes

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_Read_Access_Token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    // Request interceptor for logging in development
    this.api.interceptors.request.use(config => {
      if (import.meta.env.DEV) {
        console.log(`🎬 TMDB API: ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    })

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('TMDB API Error:', error.response?.data || error.message)
        throw error
      }
    )
  }

  // Generic method to get data with caching
  private async getCachedData<T>(
    cacheKey: string,
    fetchFunction: () => Promise<{ data: T }>
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() < cached.expiry) {
      console.log(`📱 Cache hit: ${cacheKey}`)
      return cached.data as T
    }

    try {
      // Fetch from API
      const response = await fetchFunction()

      // Cache the response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        expiry: Date.now() + this.CACHE_TTL,
      })

      return response.data
    } catch (error: unknown) {
      // Handle TMDB API errors
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: TMDBError } }
        if (apiError.response?.data) {
          throw new Error(`TMDB Error: ${apiError.response.data.status_message}`)
        }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(`Network Error: ${(error as Error).message}`)
      }
      throw new Error('Unknown error occurred')
    }
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<PopularMoviesResponse> {
    const cacheKey = `popular-${page}`
    return this.getCachedData(cacheKey, () => this.api.get(`/movie/popular?page=${page}`))
  }

  // Search movies by query
  async searchMovies(query: string, page: number = 1): Promise<SearchMoviesResponse> {
    if (!query.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 }
    }

    const cacheKey = `search-${query.toLowerCase()}-${page}`
    return this.getCachedData(cacheKey, () =>
      this.api.get<SearchMoviesResponse>(
        `/search/movie?query=${encodeURIComponent(query)}&page=${page}`
      )
    )
  }

  // Get movie details by ID
  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    const cacheKey = `movie-${movieId}`
    return this.getCachedData(cacheKey, () => this.api.get<MovieDetails>(`/movie/${movieId}`))
  }

  // Get movie by exact title (useful for AI recommendations)
  async getMovieByTitle(title: string): Promise<Movie | null> {
    try {
      const response = await this.searchMovies(title, 1)

      // Find exact match (case insensitive)
      const exactMatch = response.results.find(
        (movie: Movie) => movie.title.toLowerCase() === title.toLowerCase()
      )

      return exactMatch || response.results[0] || null
    } catch {
      console.warn(`Could not find movie: ${title}`)
      return null
    }
  }

  // Utility: Get full image URL
  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg' // We'll create this placeholder
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  // Utility: Get backdrop URL
  getBackdropUrl(path: string | null, size: string = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg'
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  // Utility: Format release date
  formatReleaseDate(dateString: string): string {
    try {
      return new Date(dateString).getFullYear().toString()
    } catch {
      return 'Unknown'
    }
  }

  // Utility: Clear cache (useful for development)
  clearCache(): void {
    this.cache.clear()
    console.log('🧹 TMDB cache cleared')
  }

  // Utility: Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Export singleton instance
export const tmdbService = new TMDBService()
