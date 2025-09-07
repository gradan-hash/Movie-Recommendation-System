import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getPopularTVSeries,
  searchTVSeries,
  getTrendingTVSeries,
  getTopRatedTVSeries
} from '@/api/tmdb'
import type { TVSeries, PopularTVSeriesResponse } from '@/types/movie'

export const useTVStore = defineStore('tv', () => {
  // State
  const currentSeries = ref<TVSeries[]>([])
  const popularSeries = ref<TVSeries[]>([])
  const searchResults = ref<TVSeries[]>([])
  
  // Loading states
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  
  // Search and pagination state
  const searchQuery = ref('')
  const currentPage = ref(1)
  const totalPages = ref(0)
  const totalResults = ref(0)
  const lastAction = ref<'popular' | 'search' | 'trending' | 'toprated'>('popular')

  // Computed
  const getCurrentSeries = computed(() => currentSeries.value)
  
  const isSearching = computed(() => !!searchQuery.value)
  
  const hasPopularSeries = computed(() => popularSeries.value.length > 0)
  
  const canLoadMore = computed(() => 
    !loading.value && !loadingMore.value && currentPage.value < totalPages.value
  )

  // Actions
  const loadPopularTVSeries = async (page: number = 1) => {
    try {
      if (page === 1) {
        loading.value = true
        error.value = null
        currentSeries.value = []
      } else {
        loadingMore.value = true
      }

      console.log(`🏪 TV Store: Loading popular TV series - page ${page}`)
      
      const response = await getPopularTVSeries(page)
      
      if (response.success && response.data) {
        const newSeries = response.data.results
        
        if (page === 1) {
          popularSeries.value = newSeries
          currentSeries.value = newSeries
        } else {
          popularSeries.value = [...popularSeries.value, ...newSeries]
          currentSeries.value = [...currentSeries.value, ...newSeries]
        }
        
        currentPage.value = response.data.page
        totalPages.value = response.data.total_pages
        totalResults.value = response.data.total_results
        lastAction.value = 'popular'
        
        console.log(`✅ TV Store: Loaded ${newSeries.length} series, total: ${currentSeries.value.length}`)
      } else {
        throw new Error(response.error || 'Failed to load popular TV series')
      }
    } catch (err: any) {
      console.error('❌ TV Store: Popular series load failed:', err.message)
      error.value = err.message
      
      // Reset state on error
      if (page === 1) {
        currentSeries.value = []
        popularSeries.value = []
        totalResults.value = 0
      }
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const searchTVSeries = async (query: string, page: number = 1) => {
    try {
      if (!query.trim()) {
        clearSearchResults()
        return
      }

      if (page === 1) {
        loading.value = true
        error.value = null
        searchQuery.value = query
        currentSeries.value = []
      } else {
        loadingMore.value = true
      }

      console.log(`🔍 TV Store: Searching TV series - "${query}" page ${page}`)
      
      const response = await searchTVSeries(query, page)
      
      if (response.success && response.data) {
        const newSeries = response.data.results
        
        if (page === 1) {
          searchResults.value = newSeries
          currentSeries.value = newSeries
        } else {
          searchResults.value = [...searchResults.value, ...newSeries]
          currentSeries.value = [...currentSeries.value, ...newSeries]
        }
        
        currentPage.value = response.data.page
        totalPages.value = response.data.total_pages
        totalResults.value = response.data.total_results
        lastAction.value = 'search'
        
        console.log(`✅ TV Store: Found ${newSeries.length} series, total: ${currentSeries.value.length}`)
      } else {
        throw new Error(response.error || 'Search failed')
      }
    } catch (err: any) {
      console.error('❌ TV Store: Search failed:', err.message)
      error.value = err.message
      
      if (page === 1) {
        currentSeries.value = []
        searchResults.value = []
        totalResults.value = 0
      }
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const loadMoreTVSeries = async () => {
    if (!canLoadMore.value) {
      console.log('ℹ️ TV Store: Cannot load more series')
      return
    }

    const nextPage = currentPage.value + 1
    console.log(`📄 TV Store: Loading more series - page ${nextPage}`)

    if (lastAction.value === 'search' && searchQuery.value) {
      await searchTVSeries(searchQuery.value, nextPage)
    } else if (lastAction.value === 'popular') {
      await loadPopularTVSeries(nextPage)
    }
  }

  const clearSearchResults = () => {
    console.log('🧹 TV Store: Clearing search results')
    
    searchQuery.value = ''
    searchResults.value = []
    currentSeries.value = popularSeries.value
    currentPage.value = Math.ceil(popularSeries.value.length / 20) || 1
    totalPages.value = Math.ceil(popularSeries.value.length / 20) || 0
    totalResults.value = popularSeries.value.length
    lastAction.value = 'popular'
    error.value = null
  }

  const retryLastAction = async () => {
    console.log(`🔄 TV Store: Retrying last action: ${lastAction.value}`)
    
    if (lastAction.value === 'search' && searchQuery.value) {
      await searchTVSeries(searchQuery.value)
    } else {
      await loadPopularTVSeries()
    }
  }

  const clearAllData = () => {
    console.log('🧹 TV Store: Clearing all data')
    
    currentSeries.value = []
    popularSeries.value = []
    searchResults.value = []
    searchQuery.value = ''
    currentPage.value = 1
    totalPages.value = 0
    totalResults.value = 0
    error.value = null
    loading.value = false
    loadingMore.value = false
    lastAction.value = 'popular'
  }

  return {
    // State
    currentSeries,
    popularSeries,
    searchResults,
    loading,
    loadingMore,
    error,
    searchQuery,
    currentPage,
    totalPages,
    totalResults,
    lastAction,

    // Computed
    getCurrentSeries,
    isSearching,
    hasPopularSeries,
    canLoadMore,

    // Actions
    loadPopularTVSeries,
    searchTVSeries,
    loadMoreTVSeries,
    clearSearchResults,
    retryLastAction,
    clearAllData
  }
})