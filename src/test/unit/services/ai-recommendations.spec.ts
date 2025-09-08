import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { AIRecommendationService } from '@/services/ai-recommendations'
import { TMDBAPI } from '@/api/tmdb'
import { globalLoader } from '@/services/loader'
import type { Movie, TMDBResponse } from '@/types/movie'

// Mock dependencies
vi.mock('@/api/tmdb')
vi.mock('@/services/loader')

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock environment variables
vi.mock('import.meta.env', () => ({
  default: {
    VITE_GEMINI_API_KEY: 'mock-api-key',
  },
}))

describe('AIRecommendationService', () => {
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

  const likedMovies: Movie[] = [
    { ...mockMovie, id: 1, title: 'Action Movie 1' },
    { ...mockMovie, id: 2, title: 'Action Movie 2' },
    { ...mockMovie, id: 3, title: 'Action Movie 3' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    AIRecommendationService.clearCache()

    // Mock globalLoader
    vi.mocked(globalLoader.wrapAPICall).mockImplementation(async fn => await fn())
  })

  afterEach(() => {
    AIRecommendationService.clearCache()
  })

  describe('generateRecommendations', () => {
    it('should return error for insufficient liked movies', async () => {
      const result = await AIRecommendationService.generateRecommendations([mockMovie])

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient data for AI recommendations')
      expect(result.aiExplanation).toBe('Please like at least 3 movies to get AI recommendations.')
    })

    it('should generate AI recommendations successfully', async () => {
      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    explanation: 'Based on your preferences for action movies',
                    recommendations: [
                      {
                        title: 'Recommended Movie',
                        year: '2023',
                        reason: 'Great action sequences',
                        confidence: 9,
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }

      const mockRecommendedMovie = {
        ...mockMovie,
        id: 999,
        title: 'Recommended Movie',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      vi.mocked(TMDBAPI.getMovieByTitle).mockResolvedValueOnce({
        success: true,
        data: mockRecommendedMovie,
      })

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(true)
      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0].movie.title).toBe('Recommended Movie')
      expect(result.recommendations[0].reason).toBe('Great action sequences')
      expect(result.recommendations[0].confidence).toBe(9)
      expect(result.recommendations[0].aiGenerated).toBe(true)
      expect(result.aiExplanation).toBe('Based on your preferences for action movies')
    })

    it('should cache recommendations', async () => {
      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    explanation: 'Test explanation',
                    recommendations: [],
                  }),
                },
              ],
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      // First call
      await AIRecommendationService.generateRecommendations(likedMovies)

      // Second call should use cache
      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('should fallback to similar movies on API failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const mockSimilarMovie = {
        ...mockMovie,
        id: 888,
        title: 'Similar Movie',
      }

      const mockSimilarResponse: TMDBResponse<Movie> = {
        page: 1,
        results: [mockSimilarMovie],
        total_pages: 1,
        total_results: 1,
      }

      vi.mocked(TMDBAPI.getSimilarMovies).mockResolvedValueOnce({
        success: true,
        data: mockSimilarResponse,
      })

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(false)
      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0].movie.title).toBe('Similar Movie')
      expect(result.recommendations[0].aiGenerated).toBe(false)
      expect(result.aiExplanation).toContain('AI service temporarily unavailable')
    })

    it('should handle Gemini API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            error: { message: 'Invalid API key' },
          }),
      })

      const mockEmptyResponse: TMDBResponse<Movie> = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }

      vi.mocked(TMDBAPI.getSimilarMovies).mockResolvedValueOnce({
        success: true,
        data: mockEmptyResponse,
      })

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Gemini API error')
    })

    it('should skip movies already liked by user', async () => {
      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    explanation: 'Test explanation',
                    recommendations: [
                      {
                        title: 'Action Movie 1', // Same as liked movie
                        year: '2023',
                        reason: 'You already like this',
                        confidence: 9,
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      vi.mocked(TMDBAPI.getMovieByTitle).mockResolvedValueOnce({
        success: true,
        data: likedMovies[0], // Return already liked movie
      })

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(true)
      expect(result.recommendations).toHaveLength(0) // Should be filtered out
    })

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: 'Invalid JSON response',
                    },
                  ],
                },
              },
            ],
          }),
      })

      const mockEmptyResponse: TMDBResponse<Movie> = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }

      vi.mocked(TMDBAPI.getSimilarMovies).mockResolvedValueOnce({
        success: true,
        data: mockEmptyResponse,
      })

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to parse AI recommendations')
    })

    it('should limit to 6 recommendations', async () => {
      const recommendations = Array.from({ length: 10 }, (_, i) => ({
        title: `Movie ${i}`,
        year: '2023',
        reason: `Reason ${i}`,
        confidence: 8,
      }))

      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    explanation: 'Test explanation',
                    recommendations,
                  }),
                },
              ],
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      // Mock successful movie fetches
      vi.mocked(TMDBAPI.getMovieByTitle).mockImplementation(title =>
        Promise.resolve({
          success: true,
          data: { ...mockMovie, title: title as string, id: Math.random() },
        })
      )

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(true)
      expect(result.recommendations).toHaveLength(6) // Should be limited to 6
    })
  })

  describe('cache management', () => {
    it('should clear cache', () => {
      AIRecommendationService.clearCache()
      const status = AIRecommendationService.getCacheStatus()
      expect(status.size).toBe(0)
    })

    it('should return cache status', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({ explanation: 'Test', recommendations: [] }),
                },
              ],
            },
          },
        ],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      await AIRecommendationService.generateRecommendations(likedMovies)

      const status = AIRecommendationService.getCacheStatus()
      expect(status.size).toBe(1)
      expect(status.keys).toHaveLength(1)
    })

    it('should cleanup old cache entries when exceeding limit', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({ explanation: 'Test', recommendations: [] }),
                },
              ],
            },
          },
        ],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      // Generate many cache entries to trigger cleanup
      const testPromises = []
      for (let i = 0; i < 52; i++) {
        const testMovies = [{ ...mockMovie, id: i }, ...likedMovies.slice(1)]
        testPromises.push(AIRecommendationService.generateRecommendations(testMovies))
      }

      await Promise.all(testPromises)

      const status = AIRecommendationService.getCacheStatus()
      expect(status.size).toBeLessThanOrEqual(50) // Should cleanup old entries
    })
  })

  describe('createRecommendationPrompt', () => {
    it('should create proper prompt with movie details', async () => {
      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({ explanation: 'Test', recommendations: [] }),
                },
              ],
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      await AIRecommendationService.generateRecommendations(likedMovies)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Action Movie 1'),
        })
      )
    })
  })

  describe('error handling', () => {
    it('should handle missing API key', async () => {
      // Mock fetch to reject as if API key was missing
      mockFetch.mockRejectedValueOnce(
        new Error(
          'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment.'
        )
      )

      const mockEmptyResponse: TMDBResponse<Movie> = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }

      vi.mocked(TMDBAPI.getSimilarMovies).mockResolvedValueOnce({
        success: true,
        data: mockEmptyResponse,
      })

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(false)
      expect(result.error).toContain('API key not configured')
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const mockEmptyResponse: TMDBResponse<Movie> = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }

      vi.mocked(TMDBAPI.getSimilarMovies).mockResolvedValueOnce({
        success: true,
        data: mockEmptyResponse,
      })

      const result = await AIRecommendationService.generateRecommendations(likedMovies)

      expect(result.success).toBe(false)
      expect(result.recommendations).toHaveLength(0)
      expect(result.aiExplanation).toContain('AI service temporarily unavailable')
    })
  })
})
