import type { Movie } from '@/types/movie'
import { TMDBAPI } from '@/api/tmdb'
import { globalLoader } from '@/services/loader'
// AI service for movie recommendations

// AI Recommendation Service using Gemini
export interface AIRecommendation {
  movie: Movie
  reason: string
  confidence: number
  aiGenerated: boolean
}

export interface AIRecommendationResponse {
  success: boolean
  recommendations: AIRecommendation[]
  aiExplanation: string
  error?: string
}

export class AIRecommendationService {
  private static readonly GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  private static readonly GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  private static cache = new Map<string, { data: AIRecommendationResponse; timestamp: number }>()
  private static readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  /**
   * Generate AI-powered movie recommendations based on user's liked movies
   */
  static async generateRecommendations(likedMovies: Movie[]): Promise<AIRecommendationResponse> {
    if (likedMovies.length < 3) {
      return {
        success: false,
        recommendations: [],
        aiExplanation: 'Please like at least 3 movies to get AI recommendations.',
        error: 'Insufficient data for AI recommendations',
      }
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(likedMovies)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    return globalLoader.wrapAPICall(
      async () => {
        try {
          // Generate AI prompt
          const prompt = this.createRecommendationPrompt(likedMovies)

          // Call Gemini API
          const aiResponse = await this.callGeminiAPI(prompt)

          // Parse AI response and fetch movie details
          const recommendations = await this.parseAndFetchMovies(aiResponse, likedMovies)

          const result: AIRecommendationResponse = {
            success: true,
            recommendations,
            aiExplanation: this.extractAIExplanation(aiResponse),
          }

          // Cache the result
          this.setCache(cacheKey, result)

          return result
        } catch (error: any) {
          // Fallback to similar movies if AI fails
          const fallbackRecommendations = await this.getFallbackRecommendations(likedMovies)

          return {
            success: false,
            recommendations: fallbackRecommendations,
            aiExplanation:
              'AI service temporarily unavailable. Showing similar movies based on your preferences.',
            error: error.message || 'AI recommendation service failed',
          }
        }
      },
      'Generating AI recommendations...',
      `ai-recommendations-${likedMovies.length}`
    )
  }

  /**
   * Create sophisticated prompt for Gemini AI
   */
  private static createRecommendationPrompt(likedMovies: Movie[]): string {
    const movieSummaries = likedMovies
      .map(movie => {
        const year = movie.release_date.split('-')[0]
        return `- "${movie.title}" (${year}) - ${movie.overview.substring(0, 100)}... (Rating: ${movie.vote_average}/10)`
      })
      .join('\n')

    return `As a movie recommendation AI expert, analyze these movies the user loved:

${movieSummaries}

Based on their preferences, recommend 6 similar movies they would enjoy. For each recommendation, provide:
1. Movie title and year
2. Brief reason why they'd like it (max 50 words)
3. Confidence score 1-10

Format your response as JSON:
{
  "explanation": "Brief analysis of their taste and recommendation strategy",
  "recommendations": [
    {
      "title": "Movie Title",
      "year": "2023",
      "reason": "Why they'd love this movie",
      "confidence": 9
    }
  ]
}

Focus on:
- Genre patterns and themes they enjoy
- Similar directors, actors, or storytelling styles
- Movies with comparable ratings and critical acclaim
- Mix of popular and hidden gems
- Avoid movies they already liked`
  }

  /**
   * Call Gemini AI API
   */
  private static async callGeminiAPI(prompt: string): Promise<any> {
    if (!this.GEMINI_API_KEY) {
      throw new Error(
        'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment.'
      )
    }

    const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      )
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini API response format')
    }

    return data.candidates[0].content.parts[0].text
  }

  /**
   * Parse AI response and fetch actual movie data from TMDB
   */
  private static async parseAndFetchMovies(
    aiResponse: string,
    likedMovies: Movie[]
  ): Promise<AIRecommendation[]> {
    try {
      // Clean the response (remove markdown formatting if present)
      const cleanResponse = aiResponse.replace(/```json\n|\n```|```/g, '').trim()
      const parsed = JSON.parse(cleanResponse)

      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid AI response format')
      }

      const recommendations: AIRecommendation[] = []
      const likedTitles = likedMovies.map(m => m.title.toLowerCase())

      for (const aiRec of parsed.recommendations) {
        try {
          // Search for the movie on TMDB
          const searchQuery = `${aiRec.title || ''} ${aiRec.year || ''}`.trim()
          if (!searchQuery) continue

          const tmdbResponse = await TMDBAPI.getMovieByTitle(searchQuery)

          if (tmdbResponse.success && tmdbResponse.data) {
            const movie = tmdbResponse.data

            // Skip if user already liked this movie
            if (likedTitles.includes(movie.title.toLowerCase())) {
              continue
            }

            recommendations.push({
              movie,
              reason: aiRec.reason || 'Recommended based on your preferences',
              confidence: Math.min(Math.max(aiRec.confidence || 7, 1), 10),
              aiGenerated: true,
            })

            // Limit to 6 recommendations
            if (recommendations.length >= 6) break
          }
        } catch (error) {
          console.warn(`Failed to fetch movie: ${aiRec.title}`, error)
          continue
        }
      }

      return recommendations
    } catch (error) {
      console.warn('Failed to parse AI response:', error)
      throw new Error('Failed to parse AI recommendations')
    }
  }

  /**
   * Get fallback recommendations using TMDB similar movies
   */
  private static async getFallbackRecommendations(
    likedMovies: Movie[]
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = []
    const seenMovies = new Set(likedMovies.map(m => m.id))

    try {
      // Get similar movies for the most recent liked movies
      for (const movie of likedMovies.slice(-3)) {
        const similarResponse = await TMDBAPI.getSimilarMovies(movie.id, 1)

        if (similarResponse.success && similarResponse.data) {
          for (const similar of similarResponse.data.results) {
            if (!seenMovies.has(similar.id) && recommendations.length < 6) {
              recommendations.push({
                movie: similar,
                reason: `Similar to "${movie.title}" which you loved`,
                confidence: 7,
                aiGenerated: false,
              })
              seenMovies.add(similar.id)
            }
          }
        }
      }
    } catch (error) {
      console.warn('Fallback recommendations failed:', error)
    }

    return recommendations
  }

  /**
   * Extract AI explanation from response
   */
  private static extractAIExplanation(aiResponse: string): string {
    try {
      const cleanResponse = aiResponse.replace(/```json\n|\n```|```/g, '').trim()
      const parsed = JSON.parse(cleanResponse)
      return parsed.explanation || 'AI-powered recommendations based on your movie preferences.'
    } catch {
      return 'AI-powered recommendations based on your movie preferences.'
    }
  }

  /**
   * Generate cache key for recommendations
   */
  private static generateCacheKey(likedMovies: Movie[]): string {
    const movieIds = likedMovies
      .map(m => m.id)
      .sort((a, b) => a - b)
      .join('-')
    return `ai-recommendations-${movieIds}`
  }

  /**
   * Get recommendations from cache
   */
  private static getFromCache(key: string): AIRecommendationResponse | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    2
    return cached.data
  }

  /**
   * Set recommendations in cache
   */
  private static setCache(key: string, data: AIRecommendationResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })

    // Clean old cache entries (keep only last 50)
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
  }

  /**
   * Clear all cached recommendations
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache status for debugging
   */
  static getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Export convenience function
export const generateAIRecommendations =
  AIRecommendationService.generateRecommendations.bind(AIRecommendationService)
export const clearAICache = AIRecommendationService.clearCache.bind(AIRecommendationService)
