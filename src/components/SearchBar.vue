<template>
  <div class="search-bar">
    <!-- Search Input - Clean Mobile-First Design -->
    <div class="relative w-full">
      <div class="relative">
        <!-- Search Icon -->
        <div class="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
          <font-awesome-icon
            icon="search"
            class="h-4 w-4 md:h-5 md:w-5 text-gray-400 transition-colors"
          />
        </div>

        <!-- Input Field - Mobile Optimized -->
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full bg-gray-800/80 backdrop-blur border border-gray-600/50 rounded-lg py-2.5 md:py-3 pl-10 md:pl-12 pr-10 md:pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-gray-800 transition-all duration-200 text-sm md:text-base"
          @keyup.enter="onEnterPress"
          @keyup.escape="clearSearch"
        />

        <!-- Loading Spinner -->
        <div v-if="isSearching" class="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center">
          <div
            class="w-4 h-4 md:w-5 md:h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <!-- Clear Button -->
        <button
          v-else-if="searchQuery"
          @click="clearSearch"
          class="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-gray-400 hover:text-red-400 transition-colors"
          type="button"
        >
          <font-awesome-icon icon="times" class="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
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
  placeholder: 'Discover your next favorite movie...',
  disabled: false,
  showStats: true,
  showSuggestions: true,
  showQuickFilters: true,
  totalResults: 0,
  isSearching: false,
  debounceMs: 300,
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
watch(searchQuery, newQuery => {
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
  clearSearch,
})
</script>

<style scoped>
.search-bar {
  @apply relative;
}

/* Mobile-first search bar optimizations */
@media (max-width: 768px) {
  .search-bar input {
    font-size: 16px; /* Prevents iOS zoom */
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    border-radius: 0.5rem;
  }

  .search-bar input:focus {
    transform: none; /* Disable transforms on mobile for better performance */
  }
}

/* Smooth animations for desktop only */
@media (min-width: 769px) {
  .search-bar input {
    transition: all 0.2s ease;
  }

  .search-bar input:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
  }
}
</style>
