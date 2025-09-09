import axios, { type AxiosResponse } from 'axios'
import { globalLoader } from '@/services/loader'
import type {
  Movie,
  MovieDetails,
  SearchMoviesResponse,
  PopularMoviesResponse,
  MovieVideosResponse,
  TVSeries,
  TVSeriesDetails,
  SearchTVSeriesResponse,
  PopularTVSeriesResponse,
  MediaItem,
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
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
tmdbApi.interceptors.request.use(config => {
  if (TMDB_ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${TMDB_ACCESS_TOKEN}`
  } else if (TMDB_API_KEY) {
    config.params = { ...config.params, api_key: TMDB_API_KEY }
  }

  return config
})

// Response interceptor for error handling
tmdbApi.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

// TMDB API endpoints
export class TMDBAPI {
  /**
   * Get popular movies endpoint
   */
  static async getPopularMovies(page: number = 1): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get(
            '/movie/popular',
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading popular movies (page ${page})`,
      `popular-movies-${page}`
    )
  }

  /**
   * Search movies endpoint
   */
  static async searchMovies(
    query: string,
    page: number = 1
  ): Promise<TMDBApiResponse<SearchMoviesResponse>> {
    if (!query.trim()) {
      return {
        success: true,
        data: { page: 1, results: [], total_pages: 0, total_results: 0 },
      }
    }

    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<SearchMoviesResponse> = await tmdbApi.get('/search/movie', {
            params: {
              query: encodeURIComponent(query),
              page,
            },
          })

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Searching for "${query}"`,
      `search-movies-${encodeURIComponent(query)}-${page}`
    )
  }

  /**
   * Get movie details endpoint
   */
  static async getMovieDetails(movieId: number): Promise<TMDBApiResponse<MovieDetails>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<MovieDetails> = await tmdbApi.get(`/movie/${movieId}`)

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading movie details`,
      `movie-details-${movieId}`
    )
  }

  /**
   * Get movie by exact title endpoint
   */
  static async getMovieByTitle(title: string): Promise<TMDBApiResponse<Movie | null>> {
    try {
      const searchResponse = await this.searchMovies(title, 1)

      if (!searchResponse.success || !searchResponse.data) {
        return {
          success: true,
          data: null,
        }
      }

      // Find exact match (case insensitive)
      const exactMatch = searchResponse.data.results.find(
        (movie: Movie) => movie.title.toLowerCase() === title.toLowerCase()
      )

      const result = exactMatch || searchResponse.data.results[0] || null

      if (result) {
      } else {
      }

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      }
    }
  }

  /**
   * Get trending movies endpoint
   */
  static async getTrendingMovies(
    timeWindow: 'day' | 'week' = 'day'
  ): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get(
            `/trending/movie/${timeWindow}`
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading trending movies (${timeWindow})`,
      `trending-movies-${timeWindow}`
    )
  }

  /**
   * Get movie videos (trailers, clips) endpoint
   */
  static async getMovieVideos(movieId: number): Promise<TMDBApiResponse<MovieVideosResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<MovieVideosResponse> = await tmdbApi.get(
            `/movie/${movieId}/videos`
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading movie videos`,
      `movie-videos-${movieId}`
    )
  }

  /**
   * Get top rated movies endpoint
   */
  static async getTopRatedMovies(
    page: number = 1
  ): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get(
            '/movie/top_rated',
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading top rated movies (page ${page})`,
      `top-rated-movies-${page}`
    )
  }

  /**
   * Get popular TV series endpoint
   */
  static async getPopularTVSeries(
    page: number = 1
  ): Promise<TMDBApiResponse<PopularTVSeriesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularTVSeriesResponse> = await tmdbApi.get(
            '/tv/popular',
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading popular TV series (page ${page})`,
      `popular-tv-${page}`
    )
  }

  /**
   * Search TV series endpoint
   */
  static async searchTVSeries(
    query: string,
    page: number = 1
  ): Promise<TMDBApiResponse<SearchTVSeriesResponse>> {
    if (!query.trim()) {
      return {
        success: true,
        data: { page: 1, results: [], total_pages: 0, total_results: 0 },
      }
    }

    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<SearchTVSeriesResponse> = await tmdbApi.get('/search/tv', {
            params: {
              query: encodeURIComponent(query),
              page,
            },
          })

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Searching TV series for "${query}"`,
      `search-tv-${encodeURIComponent(query)}-${page}`
    )
  }

  /**
   * Get TV series details endpoint
   */
  static async getTVSeriesDetails(seriesId: number): Promise<TMDBApiResponse<TVSeriesDetails>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<TVSeriesDetails> = await tmdbApi.get(`/tv/${seriesId}`)

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading TV series details`,
      `tv-details-${seriesId}`
    )
  }

  /**
   * Get trending TV series endpoint
   */
  static async getTrendingTVSeries(
    timeWindow: 'day' | 'week' = 'day'
  ): Promise<TMDBApiResponse<PopularTVSeriesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularTVSeriesResponse> = await tmdbApi.get(
            `/trending/tv/${timeWindow}`
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading trending TV series (${timeWindow})`,
      `trending-tv-${timeWindow}`
    )
  }

  /**
   * Get top rated TV series endpoint
   */
  static async getTopRatedTVSeries(
    page: number = 1
  ): Promise<TMDBApiResponse<PopularTVSeriesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularTVSeriesResponse> = await tmdbApi.get(
            '/tv/top_rated',
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading top rated TV series (page ${page})`,
      `top-rated-tv-${page}`
    )
  }

  /**
   * Convert Movie to MediaItem
   */
  static movieToMediaItem(movie: Movie): MediaItem {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genre_ids,
      popularity: movie.popularity,
      media_type: 'movie',
      original_title: movie.original_title,
    }
  }

  /**
   * Convert TVSeries to MediaItem
   */
  static tvSeriesToMediaItem(series: TVSeries): MediaItem {
    return {
      id: series.id,
      title: series.name,
      overview: series.overview,
      poster_path: series.poster_path,
      backdrop_path: series.backdrop_path,
      release_date: series.first_air_date,
      vote_average: series.vote_average,
      vote_count: series.vote_count,
      genre_ids: series.genre_ids,
      popularity: series.popularity,
      media_type: 'tv',
      original_name: series.original_name,
    }
  }

  /**
   * Get similar movies endpoint
   */
  static async getSimilarMovies(
    movieId: number,
    page: number = 1
  ): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get(
            `/movie/${movieId}/similar`,
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading similar movies`,
      `similar-movies-${movieId}-${page}`
    )
  }

  /**
   * Get similar TV series endpoint
   */
  static async getSimilarTVSeries(
    seriesId: number,
    page: number = 1
  ): Promise<TMDBApiResponse<PopularTVSeriesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularTVSeriesResponse> = await tmdbApi.get(
            `/tv/${seriesId}/similar`,
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading similar TV series`,
      `similar-tv-${seriesId}-${page}`
    )
  }

  /**
   * Get movie recommendations endpoint
   */
  static async getMovieRecommendations(
    movieId: number,
    page: number = 1
  ): Promise<TMDBApiResponse<PopularMoviesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularMoviesResponse> = await tmdbApi.get(
            `/movie/${movieId}/recommendations`,
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading movie recommendations`,
      `movie-recommendations-${movieId}-${page}`
    )
  }

  /**
   * Get TV series recommendations endpoint
   */
  static async getTVSeriesRecommendations(
    seriesId: number,
    page: number = 1
  ): Promise<TMDBApiResponse<PopularTVSeriesResponse>> {
    return globalLoader.wrapAPICall(
      async () => {
        try {
          const response: AxiosResponse<PopularTVSeriesResponse> = await tmdbApi.get(
            `/tv/${seriesId}/recommendations`,
            {
              params: { page },
            }
          )

          return {
            success: true,
            data: response.data,
            status: response.status,
          }
        } catch (error: any) {
          return {
            success: false,
            error: this.getErrorMessage(error),
            status: error.response?.status,
          }
        }
      },
      `Loading TV series recommendations`,
      `tv-recommendations-${seriesId}-${page}`
    )
  }

  /**
   * Test TMDB API configuration
   */
  static async testConfiguration(): Promise<TMDBApiResponse<any>> {
    try {
      // Test with a simple API call
      const response = await tmdbApi.get('/configuration')

      return {
        success: true,
        data: {
          message: 'TMDB API configuration is working',
          baseUrl: TMDB_BASE_URL,
          hasApiKey: !!TMDB_API_KEY,
          hasAccessToken: !!TMDB_ACCESS_TOKEN,
        },
        status: response.status,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status,
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

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
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
        503: 'Service unavailable - please try again later',
      }

      return (
        statusMessages[error.response.status] ||
        `HTTP ${error.response.status}: ${error.response.statusText}`
      )
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
export const getMovieVideos = TMDBAPI.getMovieVideos
export const getPopularTVSeries = TMDBAPI.getPopularTVSeries
export const searchTVSeries = TMDBAPI.searchTVSeries
export const getTVSeriesDetails = TMDBAPI.getTVSeriesDetails
export const getTrendingTVSeries = TMDBAPI.getTrendingTVSeries
export const getTopRatedTVSeries = TMDBAPI.getTopRatedTVSeries
export const getSimilarMovies = TMDBAPI.getSimilarMovies
export const getSimilarTVSeries = TMDBAPI.getSimilarTVSeries
export const getMovieRecommendations = TMDBAPI.getMovieRecommendations
export const getTVSeriesRecommendations = TMDBAPI.getTVSeriesRecommendations
export const movieToMediaItem = TMDBAPI.movieToMediaItem
export const tvSeriesToMediaItem = TMDBAPI.tvSeriesToMediaItem
export const testTMDBConfig = TMDBAPI.testConfiguration
export const getTMDBConfigStatus = TMDBAPI.getConfigurationStatus

// Utility functions
export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return 'https://unsplash.com/photos/a-row-of-red-seats-in-a-theater-6dVGbYs-jRw'
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
