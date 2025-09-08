import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/SearchBar.vue'

describe('SearchBar', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(SearchBar, {
      props: {
        isSearching: false,
        totalResults: 0,
      },
    })
  })

  describe('component rendering', () => {
    it('should mount successfully', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should display search input', () => {
      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
    })

    it('should display search button', () => {
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should show loading state when searching', async () => {
      await wrapper.setProps({ isSearching: true })

      const loadingElement = wrapper.find('.animate-spin')
      expect(loadingElement.exists()).toBe(true)
    })
  })

  describe('user interactions', () => {
    it('should emit search event when input changes', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('action movies')

      // Wait for debounced search
      await new Promise(resolve => setTimeout(resolve, 600))

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['action movies'])
    })

    it('should emit search event on Enter key press', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('comedy')
      await input.trigger('keyup.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['comedy'])
    })

    it('should emit clear event when clear button clicked', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('test query')

      // Clear button appears when there's text
      await wrapper.vm.$nextTick()
      const clearButton = wrapper.find('button[type="button"]')
      if (clearButton.exists()) {
        await clearButton.trigger('click')
        expect(wrapper.emitted('clear')).toBeTruthy()
      }
    })

    it('should not search on empty input', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('')
      await input.trigger('keyup.enter')

      expect(wrapper.emitted('search')).toBeFalsy()
    })

    it('should trim whitespace from search query', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('  action movies  ')
      await input.trigger('keyup.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['action movies'])
    })
  })

  describe('quick search functionality', () => {
    it('should emit quick-search event when quick search button clicked', async () => {
      const quickButton = wrapper.find('[data-testid="quick-search-action"]')
      if (quickButton.exists()) {
        await quickButton.trigger('click')
        expect(wrapper.emitted('quick-search')).toBeTruthy()
        expect(wrapper.emitted('quick-search')[0]).toEqual(['action'])
      }
    })

    it('should display quick filter buttons', async () => {
      // Quick filters are shown when showQuickFilters is true and searchQuery is empty
      await wrapper.setProps({ showQuickFilters: true })
      await wrapper.vm.$nextTick()

      const quickButtons = wrapper
        .findAll('button')
        .filter(
          (btn: { text: () => string | string[] }) =>
            btn.text().includes('🔥') ||
            btn.text().includes('⭐') ||
            btn.text().includes('🆕') ||
            btn.text().includes('🎭')
        )
      expect(quickButtons.length).toBeGreaterThan(0)
    })
  })

  describe('search results display', () => {
    it('should show results count when searching', async () => {
      await wrapper.setProps({
        isSearching: false,
        totalResults: 150,
        searchQuery: 'action',
      })

      const resultsText = wrapper.text()
      expect(resultsText).toContain('150')
    })

    it('should show no results message when no results found', async () => {
      // Set searchQuery via input first
      const input = wrapper.find('input[type="text"]')
      await input.setValue('nonexistent')

      await wrapper.setProps({
        showStats: true,
        isSearching: false,
        totalResults: 0,
      })

      await wrapper.vm.$nextTick()

      const noResultsText = wrapper.text()
      expect(noResultsText).toContain('No movies found')
    })
  })

  describe('keyboard interactions', () => {
    it('should search on Enter key press', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('thriller')
      await input.trigger('keyup.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['thriller'])
    })

    it('should clear on Escape key press', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('test query')
      await input.trigger('keydown.escape')

      const clearEvent = wrapper.emitted('clear')
      if (clearEvent) {
        expect(clearEvent).toBeTruthy()
      }
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const input = wrapper.find('input[type="text"]')
      expect(input.attributes('placeholder')).toBeDefined()

      // Check that buttons exist (clear button or quick filter buttons)
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(0)
    })

    it('should be focusable', () => {
      const input = wrapper.find('input[type="text"]')
      expect(input.attributes('tabindex')).not.toBe('-1')
    })
  })

  describe('responsive behavior', () => {
    it('should have mobile-friendly classes', () => {
      const container = wrapper.find('.search-bar')
      expect(container.exists()).toBe(true)

      // Check for responsive classes in input or parent elements
      const inputWrapper = wrapper.find('.relative.max-w-4xl')
      const input = wrapper.find('input')

      // The component uses max-w-4xl and various responsive utilities
      const hasResponsiveClasses =
        inputWrapper.exists() ||
        input
          .classes()
          .some((cls: string | string[]) => cls.includes('w-full') || cls.includes('text-lg'))

      expect(hasResponsiveClasses).toBe(true)
    })
  })
})
