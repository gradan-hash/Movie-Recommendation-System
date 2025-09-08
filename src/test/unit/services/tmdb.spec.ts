import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { TMDBService } from '@/services/tmdb'
import axios from 'axios'
import type {
  Movie,
  MovieDetails,
  SearchMoviesResponse,
  PopularMoviesResponse,
} from '@/types/movie'

// Mock axios - must be before importing TMDBService
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

// Mock environment variables
vi.mock('import.meta.env', () => ({
  default: {
    VITE_TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    VITE_API_Read_Access_Token: 'mock-token',
    DEV: false,
  },
}))

describe('TMDBService', () => {
  let tmdbService: TMDBService
  let mockAxiosInstance: any

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    vote_count: 1000,
    genre_ids: [28, 12],
    adult: false,
    original_language: 'en',
    original_title: 'Test Movie',
    popularity: 100,
    video: false,
  }

  const mockMovieDetails: MovieDetails = {
    ...mockMovie,
    runtime: 120,
    budget: 50000000,
    revenue: 100000000,
    tagline: 'Test tagline',
    homepage: 'https://test.com',
    imdb_id: 'tt1234567',
    status: 'Released',
    genres: [{ id: 28, name: 'Action' }],
    production_companies: [],
    production_countries: [],
    spoken_languages: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Set up fresh mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }

    // Mock axios.create to return our mock instance
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance)

    tmdbService = new TMDBService()
  })

  afterEach(() => {
    tmdbService.clearCache()
  })

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.themoviedb.org/3',
        headers: {
          Authorization: expect.stringContaining('Bearer '),
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })
    })

    it('should setup interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('getPopularMovies', () => {
    const mockResponse: PopularMoviesResponse = {
      page: 1,
      results: [mockMovie],
      total_pages: 10,
      total_results: 200,
    }

    it('should fetch popular movies successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await tmdbService.getPopularMovies(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular?page=1')
      expect(result).toEqual(mockResponse)
    })

    it('should use default page 1', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse })

      await tmdbService.getPopularMovies()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular?page=1')
    })

    it('should cache results', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse })

      await tmdbService.getPopularMovies(1)
      const result = await tmdbService.getPopularMovies(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: {
            status_code: 401,
            status_message: 'Invalid API key',
          },
        },
      }
      mockAxiosInstance.get.mockRejectedValueOnce(errorResponse)

      await expect(tmdbService.getPopularMovies(1)).rejects.toThrow('TMDB Error: Invalid API key')
    })
  })

  describe('searchMovies', () => {
    const mockSearchResponse: SearchMoviesResponse = {
      page: 1,
      results: [mockMovie],
      total_pages: 5,
      total_results: 50,
    }

    it('should search movies successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockSearchResponse })

      const result = await tmdbService.searchMovies('test query', 1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie?query=test%20query&page=1')
      expect(result).toEqual(mockSearchResponse)
    })

    it('should return empty results for empty query', async () => {
      const result = await tmdbService.searchMovies('', 1)

      expect(result).toEqual({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      })
      expect(mockAxiosInstance.get).not.toHaveBeenCalled()
    })

    it('should encode special characters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockSearchResponse })

      await tmdbService.searchMovies('test & query!', 1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/search/movie?query=test%20%26%20query!&page=1'
      )
    })
  })

  describe('getMovieDetails', () => {
    it('should fetch movie details successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockMovieDetails })

      const result = await tmdbService.getMovieDetails(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/1')
      expect(result).toEqual(mockMovieDetails)
    })

    it('should cache movie details', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockMovieDetails })

      await tmdbService.getMovieDetails(1)
      const result = await tmdbService.getMovieDetails(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockMovieDetails)
    })
  })

  describe('getMovieByTitle', () => {
    const searchResponse: SearchMoviesResponse = {
      page: 1,
      results: [
        { ...mockMovie, title: 'Exact Match' },
        { ...mockMovie, id: 2, title: 'Partial Match' },
      ],
      total_pages: 1,
      total_results: 2,
    }

    beforeEach(() => {
      vi.spyOn(tmdbService, 'searchMovies')
    })

    it('should return exact title match', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValueOnce(searchResponse)

      const result = await tmdbService.getMovieByTitle('Exact Match')

      expect(result?.title).toBe('Exact Match')
    })

    it('should return first result if no exact match', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValueOnce(searchResponse)

      const result = await tmdbService.getMovieByTitle('No Match')

      expect(result?.title).toBe('Exact Match')
    })

    it('should return null if no results', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValueOnce({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      })

      const result = await tmdbService.getMovieByTitle('No Results')

      expect(result).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(tmdbService.searchMovies).mockRejectedValueOnce(new Error('API Error'))

      const result = await tmdbService.getMovieByTitle('Error Query')

      expect(result).toBeNull()
    })
  })

  describe('getImageUrl', () => {
    it('should return full image URL with default size', () => {
      const result = tmdbService.getImageUrl('/test.jpg')
      expect(result).toBe('https://image.tmdb.org/t/p/w500/test.jpg')
    })

    it('should return full image URL with custom size', () => {
      const result = tmdbService.getImageUrl('/test.jpg', 'w300')
      expect(result).toBe('https://image.tmdb.org/t/p/w300/test.jpg')
    })

    it('should return placeholder for null path', () => {
      const result = tmdbService.getImageUrl(null)
      expect(result).toBe('/placeholder-movie.jpg')
    })
  })

  describe('cache management', () => {
    it('should clear cache successfully', () => {
      tmdbService.clearCache()
      const stats = tmdbService.getCacheStats()
      expect(stats.size).toBe(0)
    })

    it('should return cache stats', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { results: [] } })

      await tmdbService.getPopularMovies(1)
      await tmdbService.getPopularMovies(2)

      const stats = tmdbService.getCacheStats()
      expect(stats.size).toBe(2)
      expect(stats.keys).toContain('popular-1')
      expect(stats.keys).toContain('popular-2')
    })
  })
})
