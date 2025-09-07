<template>
  <div v-if="hasError" class="error-boundary min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 p-6">
    <div class="max-w-md w-full text-center">
      <!-- Error Animation -->
      <div class="relative mb-8">
        <div class="error-icon-container">
          <div class="error-icon">
            {{ getErrorIcon() }}
          </div>
          <div class="error-pulse"></div>
        </div>
      </div>

      <!-- Error Content -->
      <div class="space-y-4 mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
          {{ getErrorTitle() }}
        </h1>
        
        <p class="text-gray-300 text-lg leading-relaxed">
          {{ getErrorMessage() }}
        </p>

        <!-- Error Details (Development Only) -->
        <details v-if="isDevelopment && errorInfo" class="text-left mt-6 bg-gray-800/50 rounded-lg p-4">
          <summary class="text-red-400 cursor-pointer hover:text-red-300 mb-2">
            Technical Details
          </summary>
          <pre class="text-xs text-gray-400 overflow-auto max-h-32">{{ errorInfo }}</pre>
        </details>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="handleRetry"
          class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Try Again
          </span>
        </button>

        <button
          @click="handleGoHome"
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-300"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Go Home
          </span>
        </button>

        <button
          v-if="showReportButton"
          @click="handleReport"
          class="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all duration-300"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.768 0L3.046 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Report Issue
          </span>
        </button>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 text-sm text-gray-400">
        <p>If the problem persists, try:</p>
        <ul class="list-disc list-inside mt-2 space-y-1">
          <li>Refreshing the page</li>
          <li>Clearing your browser cache</li>
          <li>Checking your internet connection</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Normal Content -->
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { globalToast } from '@/services/toast'

interface Props {
  fallback?: () => void
  onError?: (error: Error, errorInfo: string) => void
  showReportButton?: boolean
  isDevelopment?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showReportButton: true,
  isDevelopment: import.meta.env.DEV
})

const router = useRouter()

// State
const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<string>('')
const errorType = ref<'network' | 'javascript' | 'chunk' | 'unknown'>('unknown')
const retryCount = ref(0)
const maxRetries = 3

// Error detection and categorization
const detectErrorType = (err: Error): typeof errorType.value => {
  const message = err.message.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network'
  } else if (message.includes('loading chunk') || message.includes('importing a module')) {
    return 'chunk'
  } else if (err instanceof TypeError || err instanceof ReferenceError) {
    return 'javascript'
  }
  
  return 'unknown'
}

const getErrorIcon = (): string => {
  const icons = {
    network: '🌐',
    javascript: '⚙️',
    chunk: '📦',
    unknown: '⚠️'
  }
  
  return icons[errorType.value]
}

const getErrorTitle = (): string => {
  const titles = {
    network: 'Connection Problem',
    javascript: 'Something Went Wrong',
    chunk: 'Loading Problem',
    unknown: 'Unexpected Error'
  }
  
  return titles[errorType.value]
}

const getErrorMessage = (): string => {
  const messages = {
    network: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
    javascript: 'A technical error occurred while loading the page. Our team has been notified.',
    chunk: 'There was a problem loading part of the application. This might be due to a recent update.',
    unknown: 'Something unexpected happened. Please try again or contact support if the problem continues.'
  }
  
  return messages[errorType.value]
}

// Error handlers
const handleError = (err: Error, info: string = '') => {
  hasError.value = true
  error.value = err
  errorInfo.value = info
  errorType.value = detectErrorType(err)
  
  console.error('Error Boundary caught an error:', err)
  console.error('Error Info:', info)
  
  // Call custom error handler if provided
  if (props.onError) {
    props.onError(err, info)
  }
  
  // Show toast notification for better UX
  globalToast.error('Oops! Something went wrong', 'We\'re working to fix this issue.')
}

const handleRetry = async () => {
  if (retryCount.value < maxRetries) {
    retryCount.value++
    
    // Clear error state
    hasError.value = false
    error.value = null
    errorInfo.value = ''
    
    // Show loading toast
    globalToast.info('Retrying...', 'Attempting to recover from the error.')
    
    // For chunk loading errors, force reload
    if (errorType.value === 'chunk') {
      window.location.reload()
      return
    }
    
    // Custom fallback if provided
    if (props.fallback) {
      try {
        await props.fallback()
      } catch (err) {
        // If retry fails, show error again
        if (err instanceof Error) {
          handleError(err)
        }
      }
    }
    
    // Auto-retry for network errors after delay
    if (errorType.value === 'network') {
      setTimeout(() => {
        if (hasError.value) {
          handleRetry()
        }
      }, 2000)
    }
  } else {
    globalToast.warning('Max Retries Reached', 'Please refresh the page or try again later.')
  }
}

const handleGoHome = () => {
  router.push('/')
  globalToast.info('Redirected to Home', 'You\'ve been taken to the homepage.')
}

const handleReport = () => {
  // Create error report
  const report = {
    error: error.value?.message || 'Unknown error',
    stack: error.value?.stack || 'No stack trace',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    errorType: errorType.value,
    retryCount: retryCount.value
  }
  
  // Log to console for development
  console.warn('Error Report:', report)
  
  // In a real app, you'd send this to your error reporting service
  // Example: Sentry, LogRocket, Rollbar, etc.
  
  globalToast.success('Report Sent', 'Thank you! The error has been reported to our team.')
}

// Vue error handling
onErrorCaptured((err, instance, info) => {
  handleError(err, info)
  return false // Prevent error from propagating
})

// Global error handling
onMounted(() => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    handleError(error, 'Unhandled Promise Rejection')
    event.preventDefault()
  })
  
  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message)
    handleError(error, `Global Error: ${event.filename}:${event.lineno}:${event.colno}`)
  })
  
  // Handle chunk loading errors specifically
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLScriptElement | HTMLLinkElement
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const error = new Error(`Failed to load ${target.tagName.toLowerCase()}: ${target.src || target.href}`)
      handleError(error, 'Resource Loading Error')
    }
  }, true)
})
</script>

<style scoped>
/* Error boundary animations */
.error-boundary {
  animation: errorFadeIn 0.6s ease-out;
}

@keyframes errorFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error icon animation */
.error-icon-container {
  position: relative;
  display: inline-block;
}

.error-icon {
  font-size: 4rem;
  position: relative;
  z-index: 2;
  animation: errorBounce 2s ease-in-out infinite;
}

.error-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 2px solid rgb(239, 68, 68, 0.3);
  border-radius: 50%;
  animation: errorPulse 2s ease-in-out infinite;
}

@keyframes errorBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes errorPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Code formatting */
pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>