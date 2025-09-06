<template>
  <div class="search-bar">
    <!-- Search Input -->
    <div class="relative max-w-2xl mx-auto">
      <div class="relative">
        <!-- Search Icon -->
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <!-- Input Field -->
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full bg-gray-800 border border-gray-700 rounded-full py-4 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200"
          @keyup.enter="onEnterPress"
          @keyup.escape="clearSearch"
        />
        
        <!-- Loading Spinner -->
        <div v-if="isSearching" class="absolute inset-y-0 right-0 pr-4 flex items-center">
          <div class="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
        </div>
        
        <!-- Clear Button -->
        <button
          v-else-if="searchQuery"
          @click="clearSearch"
          class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
          type="button"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Search Suggestions -->
      <div 
        v-if="showSuggestions && suggestions.length"
        class="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
      >
        <div class="p-2">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
            Popular Searches
          </div>
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            @click="selectSuggestion(suggestion)"
            class="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded transition-colors"
          >
            {{ suggestion }}
          </button>
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
    <div v-if="showQuickFilters && !searchQuery" class="flex justify-center gap-2 mt-4 flex-wrap">
      <button
        v-for="filter in quickFilters"
        :key="filter"
        @click="quickSearch(filter)"
        class="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 hover:text-white transition-colors"
      >
        {{ filter }}
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
  placeholder: 'Search for movies...',
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
  'Marvel',
  'DC Comics', 
  'Action',
  'Comedy',
  'Horror',
  'Sci-Fi',
  'Romance',
  'Drama'
])

// Quick filters
const quickFilters = ref([
  'Popular Now',
  'Top Rated',
  'Recent Releases',
  'Classic Movies'
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