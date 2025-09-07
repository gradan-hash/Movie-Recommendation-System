<template>
  <div class="search-bar">
    <!-- Search Input -->
    <div class="relative max-w-4xl mx-auto">
      <div class="relative group">
        <!-- Search Icon -->
        <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
          <svg class="h-6 w-6 text-gray-300 group-focus-within:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <!-- Background Glow Effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500"></div>
        
        <!-- Input Field -->
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          :disabled="disabled"
          class="relative w-full bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-2 border-gray-700/50 rounded-2xl py-6 pl-16 pr-16 text-white placeholder-gray-300 focus:outline-none focus:border-red-500/70 focus:ring-4 focus:ring-red-500/20 transition-all duration-300 text-lg font-medium shadow-2xl"
          @keyup.enter="onEnterPress"
          @keyup.escape="clearSearch"
        />
        
        <!-- Loading Spinner -->
        <div v-if="isSearching" class="absolute inset-y-0 right-0 pr-6 flex items-center z-10">
          <div class="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <!-- Clear Button -->
        <button
          v-else-if="searchQuery"
          @click="clearSearch"
          class="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-red-400 transition-all duration-200 z-10"
          type="button"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <!-- Keyboard Shortcut Hint -->
        <div v-if="!searchQuery && !isSearching" class="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none z-10">
          <div class="hidden md:flex items-center gap-1 text-gray-500 text-sm">
            <kbd class="px-2 py-1 bg-gray-700/50 rounded text-xs">⌘</kbd>
            <kbd class="px-2 py-1 bg-gray-700/50 rounded text-xs">K</kbd>
          </div>
        </div>
      </div>
      
      <!-- Search Suggestions -->
      <div 
        v-if="showSuggestions && suggestions.length"
        class="absolute top-full left-0 right-0 mt-4 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50 max-h-80 overflow-hidden"
      >
        <div class="p-4">
          <div class="text-sm font-bold text-gray-300 uppercase tracking-wide px-4 py-3 border-b border-gray-700/50 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            Trending Searches
          </div>
          <div class="space-y-1">
            <button
              v-for="(suggestion, index) in suggestions"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              class="w-full text-left px-4 py-3 text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-purple-500/20 rounded-xl transition-all duration-200 flex items-center gap-3 group"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:from-red-500/30 group-hover:to-purple-500/30 transition-all">
                <span class="text-sm font-bold text-gray-300">{{ index + 1 }}</span>
              </div>
              <span class="font-medium">{{ suggestion }}</span>
              <svg class="w-4 h-4 text-gray-500 ml-auto group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Search Stats -->
    <div v-if="showStats && (totalResults > 0 || searchQuery)" class="text-center mt-4 text-gray-400 text-sm">
      <span v-if="totalResults > 0">
        Found {{ totalResults.toLocaleString() }} movies
      </span>
      <span v-else-if="searchQuery && !isSearching">
        No movies found for "{{ searchQuery }}"
      </span>
      <button 
        v-if="searchQuery"
        @click="clearSearch"
        class="ml-2 text-red-400 hover:text-red-300 underline"
      >
        Clear search
      </button>
    </div>
    
    <!-- Quick Filters -->
    <div v-if="showQuickFilters && !searchQuery" class="flex justify-center gap-3 mt-8 flex-wrap">
      <button
        v-for="(filter, index) in quickFilters"
        :key="filter"
        @click="quickSearch(filter)"
        class="group relative px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm text-gray-300 rounded-2xl text-sm font-medium hover:from-red-500/20 hover:to-purple-500/20 hover:text-white transition-all duration-300 border border-gray-700/50 hover:border-red-500/50 shadow-lg hover:shadow-red-500/20"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 to-purple-500/0 group-hover:from-red-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300"></div>
        <span class="relative">{{ filter }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  placeholder?: string
  disabled?: boolean
  showStats?: boolean
  showSuggestions?: boolean
  showQuickFilters?: boolean
  totalResults?: number
  isSearching?: boolean
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '🎬 Discover your next favorite movie...',
  disabled: false,
  showStats: true,
  showSuggestions: true,
  showQuickFilters: true,
  totalResults: 0,
  isSearching: false,
  debounceMs: 500
})

// Emits
const emit = defineEmits<{
  search: [query: string]
  clear: []
  'quick-search': [query: string]
}>()

// Reactive state
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const debounceTimer = ref<ReturnType<typeof setTimeout>>()

// Popular search suggestions
const suggestions = ref([
  'Marvel Universe',
  'Sci-Fi Thrillers',
  'Horror Classics',
])

// Quick filters
const quickFilters = ref([
  '🔥 Trending Now',
  '⭐ Top Rated',
  '🆕 Latest Releases',
  '🎭 Award Winners'
])

// Debounced search
const debouncedSearch = (query: string) => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  
  debounceTimer.value = setTimeout(() => {
    emit('search', query)
  }, props.debounceMs)
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    debouncedSearch(newQuery.trim())
  } else {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }
    emit('clear')
  }
})

// Methods
const clearSearch = () => {
  searchQuery.value = ''
  emit('clear')
  searchInput.value?.focus()
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  // The watch will trigger the search
}

const quickSearch = (filter: string) => {
  emit('quick-search', filter)
}

const onEnterPress = () => {
  if (searchQuery.value.trim()) {
    // Clear debounce and search immediately
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }
    emit('search', searchQuery.value.trim())
  }
}

// Focus management
const focusSearch = () => {
  searchInput.value?.focus()
}

// Keyboard shortcut (Ctrl/Cmd + K)
const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    focusSearch()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})

// Expose methods
defineExpose({
  focusSearch,
  clearSearch
})
</script>

<style scoped>
.search-bar {
  @apply relative;
}

/* Custom animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Search suggestions scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-gray-800;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style>