<template>
  <div class="pagination" v-if="totalPages > 1">
    <!-- Mobile Pagination -->
    <div class="block sm:hidden">
      <div class="flex items-center justify-between bg-gray-800 rounded-lg p-3">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="currentPage === 1 ? 'text-gray-500' : 'text-white hover:bg-gray-700'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          Previous
        </button>

        <div class="text-sm text-gray-300">Page {{ currentPage }} of {{ totalPages }}</div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="currentPage === totalPages ? 'text-gray-500' : 'text-white hover:bg-gray-700'"
        >
          Next
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Desktop Pagination -->
    <div class="hidden sm:flex items-center justify-center gap-2">
      <!-- Previous Button -->
      <button
        @click="previousPage"
        :disabled="currentPage === 1"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="currentPage === 1 ? 'text-gray-500' : 'text-white hover:bg-gray-700'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
        Previous
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            @click="goToPage(page as number)"
            class="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors"
            :class="
              page === currentPage
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            "
          >
            {{ page }}
          </button>
          <span v-else class="px-2 text-gray-500">...</span>
        </template>
      </div>

      <!-- Next Button -->
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="currentPage === totalPages ? 'text-gray-500' : 'text-white hover:bg-gray-700'"
      >
        Next
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Results Info -->
    <div class="text-center text-sm text-gray-400 mt-4">
      Showing {{ (currentPage - 1) * itemsPerPage + 1 }} -
      {{ Math.min(currentPage * itemsPerPage, totalResults) }} of
      {{ totalResults.toLocaleString() }} results
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  totalResults: number
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 24,
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

// Compute visible page numbers for pagination
const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (
    let i = Math.max(2, props.currentPage - delta);
    i <= Math.min(props.totalPages - 1, props.currentPage + delta);
    i++
  ) {
    range.push(i)
  }

  if (props.currentPage - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (props.currentPage + delta < props.totalPages - 1) {
    rangeWithDots.push('...', props.totalPages)
  } else {
    rangeWithDots.push(props.totalPages)
  }

  return rangeWithDots
})

// Methods
const goToPage = (page: number) => {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

const previousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('page-change', props.currentPage + 1)
  }
}
</script>

<style scoped>
.pagination {
  @apply mt-6 sm:mt-8;
}
</style>
