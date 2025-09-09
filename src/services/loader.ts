import { ref, computed } from 'vue'

interface LoadingOperation {
  id: string
  label: string
  startTime: number
}

// Global loading state
const activeOperations = ref<Map<string, LoadingOperation>>(new Map())

export const useLoader = () => {
  // Computed
  const isLoading = computed(() => activeOperations.value.size > 0)
  const currentOperation = computed(() => {
    const operations = Array.from(activeOperations.value.values())
    return operations.length > 0 ? operations[operations.length - 1] : null
  })
  const operationCount = computed(() => activeOperations.value.size)

  // Methods
  const startLoading = (id: string, label: string = 'Loading...') => {
    const operation: LoadingOperation = {
      id,
      label,
      startTime: Date.now(),
    }

    activeOperations.value.set(id, operation)
  }

  const stopLoading = (id: string) => {
    const operation = activeOperations.value.get(id)
    if (operation) {
      activeOperations.value.delete(id)
    }
  }

  const stopAllLoading = () => {
    activeOperations.value.clear()
  }

  // Auto-wrapper for API calls
  const wrapAPICall = async <T>(
    apiCall: () => Promise<T>,
    label: string,
    id?: string
  ): Promise<T> => {
    const operationId = id || `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    startLoading(operationId, label)
    try {
      const result = await apiCall()
      return result
    } finally {
      stopLoading(operationId)
    }
  }

  return {
    // State
    isLoading,
    currentOperation,
    operationCount,
    activeOperations: computed(() => Array.from(activeOperations.value.values())),

    // Methods
    startLoading,
    stopLoading,
    stopAllLoading,
    wrapAPICall,
  }
}

// Global loader instance
export const globalLoader = useLoader()
