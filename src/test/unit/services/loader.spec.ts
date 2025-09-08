import { describe, it, expect, beforeEach, vi } from 'vitest'
import { globalLoader, useLoader } from '@/services/loader'

describe('LoaderService', () => {
  let loaderService: ReturnType<typeof useLoader>

  beforeEach(() => {
    loaderService = useLoader()
    // Clear any existing operations
    loaderService.stopAllLoading()
  })

  describe('basic loading state', () => {
    it('should start with no loading state', () => {
      expect(loaderService.isLoading.value).toBe(false)
      expect(loaderService.currentOperation.value).toBeNull()
      expect(loaderService.operationCount.value).toBe(0)
    })

    it('should show loading when started', () => {
      loaderService.startLoading('test-id', 'Loading test...')

      expect(loaderService.isLoading.value).toBe(true)
      expect(loaderService.currentOperation.value).toBeTruthy()
      expect(loaderService.currentOperation.value?.id).toBe('test-id')
      expect(loaderService.currentOperation.value?.label).toBe('Loading test...')
      expect(loaderService.operationCount.value).toBe(1)
    })

    it('should hide loading when stopped', () => {
      loaderService.startLoading('test-id', 'Loading test...')
      expect(loaderService.isLoading.value).toBe(true)

      loaderService.stopLoading('test-id')

      expect(loaderService.isLoading.value).toBe(false)
      expect(loaderService.currentOperation.value).toBeNull()
      expect(loaderService.operationCount.value).toBe(0)
    })

    it('should use default message', () => {
      loaderService.startLoading('test-id')

      expect(loaderService.isLoading.value).toBe(true)
      expect(loaderService.currentOperation.value?.label).toBe('Loading...')
    })
  })

  describe('nested loading operations', () => {
    it('should handle multiple loading operations', () => {
      loaderService.startLoading('op1', 'First operation')
      loaderService.startLoading('op2', 'Second operation')

      expect(loaderService.isLoading.value).toBe(true)
      expect(loaderService.operationCount.value).toBe(2)
      expect(loaderService.currentOperation.value?.id).toBe('op2') // Most recent
      expect(loaderService.currentOperation.value?.label).toBe('Second operation')
    })

    it('should handle stopping all operations', () => {
      loaderService.startLoading('op1', 'First operation')
      loaderService.startLoading('op2', 'Second operation')

      expect(loaderService.operationCount.value).toBe(2)

      loaderService.stopAllLoading()

      expect(loaderService.isLoading.value).toBe(false)
      expect(loaderService.operationCount.value).toBe(0)
      expect(loaderService.currentOperation.value).toBeNull()
    })
  })

  describe('operation management', () => {
    it('should track active operations', () => {
      loaderService.startLoading('op1', 'First operation')
      loaderService.startLoading('op2', 'Second operation')

      const activeOps = loaderService.activeOperations.value
      expect(activeOps).toHaveLength(2)
      expect(activeOps.find(op => op.id === 'op1')).toBeDefined()
      expect(activeOps.find(op => op.id === 'op2')).toBeDefined()
    })

    it('should remove specific operation when stopped', () => {
      loaderService.startLoading('op1', 'First operation')
      loaderService.startLoading('op2', 'Second operation')

      loaderService.stopLoading('op1')

      expect(loaderService.operationCount.value).toBe(1)
      expect(loaderService.activeOperations.value.find(op => op.id === 'op1')).toBeUndefined()
      expect(loaderService.activeOperations.value.find(op => op.id === 'op2')).toBeDefined()
    })
  })

  describe('wrapAPICall', () => {
    it('should wrap successful API call', async () => {
      const mockApiCall = vi.fn().mockResolvedValue('success')

      const result = await loaderService.wrapAPICall(mockApiCall, 'Test API call')

      expect(result).toBe('success')
      expect(mockApiCall).toHaveBeenCalledTimes(1)
      // Operation should be completed and removed
      expect(loaderService.isLoading.value).toBe(false)
    })

    it('should wrap failed API call', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'))

      await expect(loaderService.wrapAPICall(mockApiCall, 'Test API call')).rejects.toThrow(
        'API Error'
      )

      expect(mockApiCall).toHaveBeenCalledTimes(1)
      // Operation should be completed and removed even on failure
      expect(loaderService.isLoading.value).toBe(false)
    })

    it('should show loading during API call', async () => {
      let loadingDuringCall = false

      const mockApiCall = vi.fn().mockImplementation(async () => {
        loadingDuringCall = loaderService.isLoading.value
        return 'success'
      })

      await loaderService.wrapAPICall(mockApiCall, 'Test API call')

      expect(loadingDuringCall).toBe(true)
      expect(loaderService.isLoading.value).toBe(false) // Should be false after completion
    })

    it('should use custom operation ID when provided', async () => {
      let operationIdDuringCall = ''

      const mockApiCall = vi.fn().mockImplementation(async () => {
        operationIdDuringCall = loaderService.currentOperation.value?.id || ''
        return 'success'
      })

      await loaderService.wrapAPICall(mockApiCall, 'Test API call', 'custom-id')

      expect(operationIdDuringCall).toBe('custom-id')
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent API calls', async () => {
      const mockApiCall1 = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('result1'), 10)))
      const mockApiCall2 = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('result2'), 20)))

      const promise1 = loaderService.wrapAPICall(mockApiCall1, 'API Call 1', 'call1')
      const promise2 = loaderService.wrapAPICall(mockApiCall2, 'API Call 2', 'call2')

      // Both should be loading initially
      expect(loaderService.operationCount.value).toBe(2)
      expect(loaderService.isLoading.value).toBe(true)

      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(result1).toBe('result1')
      expect(result2).toBe('result2')
      expect(loaderService.isLoading.value).toBe(false)
      expect(loaderService.operationCount.value).toBe(0)
    })
  })

  describe('operation timing', () => {
    it('should track operation start time', () => {
      const before = Date.now()
      loaderService.startLoading('test-op', 'Test operation')
      const after = Date.now()

      const operation = loaderService.currentOperation.value
      expect(operation?.startTime).toBeGreaterThanOrEqual(before)
      expect(operation?.startTime).toBeLessThanOrEqual(after)
    })
  })
})

describe('globalLoader', () => {
  beforeEach(() => {
    globalLoader.stopAllLoading()
  })

  it('should be a loader instance', () => {
    expect(globalLoader).toBeDefined()
    expect(globalLoader.isLoading).toBeDefined()
    expect(globalLoader.startLoading).toBeDefined()
    expect(globalLoader.stopLoading).toBeDefined()
    expect(globalLoader.wrapAPICall).toBeDefined()
  })

  it('should provide global loading functionality', async () => {
    const mockApiCall = vi.fn().mockResolvedValue('global result')

    const result = await globalLoader.wrapAPICall(
      mockApiCall,
      'Global loading...',
      'global-context'
    )

    expect(result).toBe('global result')
    expect(mockApiCall).toHaveBeenCalledTimes(1)
    expect(globalLoader.isLoading.value).toBe(false)
  })

  it('should maintain state across multiple calls', () => {
    globalLoader.startLoading('persistent-op', 'Persistent operation')

    expect(globalLoader.isLoading.value).toBe(true)
    expect(globalLoader.operationCount.value).toBe(1)

    // Create another instance - shares the same global state
    const newLoader = useLoader()
    expect(newLoader.isLoading.value).toBe(true) // Same state as global
    expect(newLoader.operationCount.value).toBe(1) // Same operation count

    // Both instances should have the same operation
    expect(globalLoader.operationCount.value).toBe(1)
    expect(newLoader.operationCount.value).toBe(1)
  })
})
