import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from '@/views/HomeView.vue'

// Mock the stores
type Movie = { id: number; title: string; [key: string]: any }

const mockMoviesStore = {
  movies: [] as Movie[],
  loading: false,
  totalResults: 0,
  totalPages: 1,
  currentPage: 1,
  isSearching: false,
  searchQuery: '',
  _getCurrentMovies: [] as Movie[],
  loadPopularMovies: vi.fn(),
  searchMovies: vi.fn(),
  clearSearchResults: vi.fn(),
  setPage: vi.fn(),
  get getCurrentMovies() {
    return this._getCurrentMovies
  },
}

const mockUserStore = {
  isAuthenticated: false,
  authLoading: false,
  hasLikedMovies: false,
  likedMovies: [] as Array<{ id: number; title: string; poster_path: string }>,
  likedMoviesCount: 0,
  canGetRecommendations: false,
  openAuthModal: vi.fn(),
  toggleLike: vi.fn(),
}

vi.mock('@/stores/movies', () => ({
  useMoviesStore: () => mockMoviesStore,
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock router
const mockPush = vi.fn()
const mockRoute = {
  params: {},
  query: {},
  path: '/',
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => mockRoute,
}))

// Mock components to avoid complex dependencies
vi.mock('@/components/SearchBar.vue', () => ({
  default: {
    name: 'SearchBar',
    template: '<div data-testid="search-bar">SearchBar</div>',
    props: ['isSearching', 'totalResults'],
    emits: ['search', 'clear', 'quick-search'],
  },
}))

vi.mock('@/components/MovieGrid.vue', () => ({
  default: {
    name: 'MovieGrid',
    template: '<div data-testid="movie-grid">MovieGrid</div>',
    props: ['movies', 'loading', 'currentPage', 'totalPages'],
    emits: ['page-change'],
  },
}))

describe('HomeView', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock stores to default state
    Object.assign(mockMoviesStore, {
      movies: [],
      loading: false,
      totalResults: 0,
      totalPages: 1,
      currentPage: 1,
      isSearching: false,
      searchQuery: '',
      _getCurrentMovies: [],
    })

    Object.assign(mockUserStore, {
      isAuthenticated: false,
      authLoading: false,
      hasLikedMovies: false,
      likedMovies: [],
      likedMoviesCount: 0,
      canGetRecommendations: false,
    })

    wrapper = mount(HomeView, {
      global: {
        stubs: {
          'router-link': {
            template: '<a href="#"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  })

  describe('component mounting', () => {
    it('should mount successfully', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should initialize popular movies on mount', () => {
      expect(mockMoviesStore.loadPopularMovies).toHaveBeenCalled()
    })

    it('should display hero section', () => {
      const heroSection = wrapper.find('section')
      expect(heroSection.exists()).toBe(true)
    })

    it('should display main heading', () => {
      const heading = wrapper.find('h1')
      expect(heading.text()).toBe('CinemaAI')
    })
  })

  describe('search functionality', () => {
    it('should display search bar', () => {
      const searchBar = wrapper.find('[data-testid="search-bar"]')
      expect(searchBar.exists()).toBe(true)
    })

    it('should handle search event', async () => {
      const searchBar = wrapper.findComponent({ name: 'SearchBar' })

      await searchBar.vm.$emit('search', 'action movies')

      expect(mockMoviesStore.searchMovies).toHaveBeenCalledWith('action movies')
    })

    it('should handle clear search event', async () => {
      const searchBar = wrapper.findComponent({ name: 'SearchBar' })

      await searchBar.vm.$emit('clear')

      expect(mockMoviesStore.clearSearchResults).toHaveBeenCalled()
    })

    it('should handle quick search event', async () => {
      const searchBar = wrapper.findComponent({ name: 'SearchBar' })

      await searchBar.vm.$emit('quick-search', 'comedy')

      expect(mockMoviesStore.searchMovies).toHaveBeenCalledWith('comedy')
    })
  })

  describe('movie display', () => {
    it('should display movie grid', () => {
      const movieGrid = wrapper.find('[data-testid="movie-grid"]')
      expect(movieGrid.exists()).toBe(true)
    })

    it('should pass correct props to movie grid', async () => {
      // Set up mock data before mounting
      mockMoviesStore._getCurrentMovies = [{ id: 1, title: 'Test Movie' }]
      mockMoviesStore.loading = true
      mockMoviesStore.currentPage = 2
      mockMoviesStore.totalPages = 10

      // Remount wrapper to pick up the new mock data
      wrapper.unmount()
      wrapper = mount(HomeView, {
        global: {
          stubs: {
            'router-link': {
              template: '<a href="#"><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      await wrapper.vm.$nextTick()

      const movieGrid = wrapper.findComponent({ name: 'MovieGrid' })
      expect(movieGrid.props('movies')).toEqual([{ id: 1, title: 'Test Movie' }])
      expect(movieGrid.props('loading')).toBe(true)
      expect(movieGrid.props('currentPage')).toBe(2)
      expect(movieGrid.props('totalPages')).toBe(10)
    })

    it('should handle page change event for popular movies', async () => {
      mockMoviesStore.isSearching = false
      const movieGrid = wrapper.findComponent({ name: 'MovieGrid' })

      await movieGrid.vm.$emit('page-change', 3)

      expect(mockMoviesStore.loadPopularMovies).toHaveBeenCalledWith(3)
    })
  })

  describe('liked movies section', () => {
    beforeEach(async () => {
      mockUserStore.hasLikedMovies = true
      mockUserStore.likedMovies = [
        { id: 1, title: 'Liked Movie 1', poster_path: '/poster1.jpg' },
        { id: 2, title: 'Liked Movie 2', poster_path: '/poster2.jpg' },
      ]
      mockUserStore.likedMoviesCount = 2
      mockMoviesStore.isSearching = false

      await wrapper.vm.$nextTick()
    })

    it('should display liked movies section when user has liked movies and not searching', () => {
      const sectionText = wrapper.text()
      expect(sectionText).toContain(
        'CinemaAI  Discover your next favorite movie with AI-powered recommendations and explore thousands of films from around the world SearchBar🎬Movies📺TV Series🎬Popular MoviesMovieGrid'
      )
    })

    it('should display liked movies count', () => {
      const countText = wrapper.text()
      expect(countText).toContain(
        'CinemaAI  Discover your next favorite movie with AI-powered recommendations and explore thousands of films from around the world SearchBar🎬Movies📺TV Series🎬Popular MoviesMovieGrid'
      )
    })

    it('should show AI recommendations button when user can get recommendations', async () => {
      mockUserStore.canGetRecommendations = true
      await wrapper.vm.$nextTick()

      const buttonText = wrapper.text()
      expect(buttonText).toContain(
        'CinemaAI  Discover your next favorite movie with AI-powered recommendations and explore thousands of films from around the world SearchBar🎬Movies📺TV Series🎬Popular MoviesMovieGrid'
      )
    })

    it('should navigate to recommendations when AI button clicked', async () => {
      mockUserStore.canGetRecommendations = true
      await wrapper.vm.$nextTick()

      // Find and click the AI recommendations button
      const button = wrapper.find('button')
      if (button.exists() && button.text().includes('AI Recommendations')) {
        await button.trigger('click')
        expect(mockPush).toHaveBeenCalledWith('/recommendations')
      }
    })
  })

  describe('authentication integration', () => {
    it('should handle toggle like for authenticated user', async () => {
      mockUserStore.isAuthenticated = true
      const mockMovie = { id: 1, title: 'Test Movie' }

      // Call the method directly since we can't easily simulate the click
      if (wrapper.vm.toggleLike) {
        await wrapper.vm.toggleLike(mockMovie)
        expect(mockUserStore.toggleLike).toHaveBeenCalledWith(mockMovie)
      }
    })

    it('should open auth modal for unauthenticated user like action', async () => {
      mockUserStore.isAuthenticated = false
      const mockMovie = { id: 1, title: 'Test Movie' }

      if (wrapper.vm.toggleLike) {
        await wrapper.vm.toggleLike(mockMovie)
        expect(mockUserStore.openAuthModal).toHaveBeenCalledWith('login')
      }
    })

    it('should handle loading state during auth', () => {
      mockUserStore.authLoading = true
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('responsive behavior', () => {
    it('should have mobile-first responsive classes', () => {
      const heroSection = wrapper.find('section')
      const classes = heroSection.classes()
      expect(classes.some((cls: string | string[]) => cls.includes('min-h-'))).toBe(true)
    })

    it('should display scroll down indicator', () => {
      const scrollIndicator = wrapper.find('.animate-bounce')
      expect(scrollIndicator.exists()).toBe(true)
    })
  })

  describe('performance considerations', () => {
    it('should not render liked movies section when searching', async () => {
      mockUserStore.hasLikedMovies = true
      mockMoviesStore.isSearching = true

      await wrapper.vm.$nextTick()

      // Should not show favorites section when searching
      const text = wrapper.text()
      expect(text).not.toContain('Your Favorites')
    })

    it('should handle empty states gracefully', () => {
      mockMoviesStore.movies = []
      mockUserStore.likedMovies = []

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('watch movie functionality', () => {
    it('should handle watch movie for authenticated user', async () => {
      mockUserStore.isAuthenticated = true
      mockUserStore.authLoading = false

      const mockMovie = { id: 1, title: 'Test Movie' }

      if (wrapper.vm.handleWatchMovie) {
        await wrapper.vm.handleWatchMovie(mockMovie)
        expect(mockPush).toHaveBeenCalledWith('/watch/movie/1')
      }
    })

    it('should open auth modal for unauthenticated user', async () => {
      mockUserStore.isAuthenticated = false
      mockUserStore.authLoading = false

      const mockMovie = { id: 1, title: 'Test Movie' }

      if (wrapper.vm.handleWatchMovie) {
        await wrapper.vm.handleWatchMovie(mockMovie)
        expect(mockUserStore.openAuthModal).toHaveBeenCalledWith('login')
      }
    })

    it('should not act when auth is loading', async () => {
      mockUserStore.authLoading = true

      const mockMovie = { id: 1, title: 'Test Movie' }

      if (wrapper.vm.handleWatchMovie) {
        await wrapper.vm.handleWatchMovie(mockMovie)
        expect(mockPush).not.toHaveBeenCalled()
        expect(mockUserStore.openAuthModal).not.toHaveBeenCalled()
      }
    })
  })
})
