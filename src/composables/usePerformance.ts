import { ref, nextTick, onMounted, onUnmounted } from 'vue'

interface PerformanceMetrics {
  fps: number
  memoryUsage?: number
  domNodes: number
  renderTime: number
  apiCallCount: number
  totalLoadTime: number
}

interface LazyLoadOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  loadingClass?: string
  loadedClass?: string
  errorClass?: string
}

export const usePerformance = () => {
  const metrics = ref<PerformanceMetrics>({
    fps: 0,
    domNodes: 0,
    renderTime: 0,
    apiCallCount: 0,
    totalLoadTime: 0,
  })

  const isOptimizing = ref(false)
  const performanceObserver = ref<PerformanceObserver | null>(null)

  let fpsStartTime = 0
  let fpsFrameCount = 0
  let fpsAnimationId: number | null = null

  // FPS Monitoring
  const startFPSMonitoring = () => {
    const measureFPS = (currentTime: number) => {
      if (!fpsStartTime) {
        fpsStartTime = currentTime
      }

      fpsFrameCount++

      const elapsed = currentTime - fpsStartTime

      if (elapsed >= 1000) {
        // Calculate FPS every second
        metrics.value.fps = Math.round((fpsFrameCount * 1000) / elapsed)
        fpsStartTime = currentTime
        fpsFrameCount = 0
      }

      fpsAnimationId = requestAnimationFrame(measureFPS)
    }

    fpsAnimationId = requestAnimationFrame(measureFPS)
  }

  const stopFPSMonitoring = () => {
    if (fpsAnimationId) {
      cancelAnimationFrame(fpsAnimationId)
      fpsAnimationId = null
    }
  }

  // Memory Usage Monitoring (if available)
  const getMemoryUsage = (): number | undefined => {
    // @ts-ignore - performance.memory is not in standard types
    if (window.performance && window.performance.memory) {
      // @ts-ignore
      return Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)) // MB
    }
    return undefined
  }

  // DOM Node Counting
  const countDOMNodes = (): number => {
    return document.getElementsByTagName('*').length
  }

  // Performance Observer for API calls and render times
  const initPerformanceObserver = () => {
    if (!window.PerformanceObserver) return

    performanceObserver.value = new PerformanceObserver(list => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        if (entry.entryType === 'measure') {
          metrics.value.renderTime = Math.round(entry.duration)
        } else if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming
          metrics.value.totalLoadTime = Math.round(
            navigationEntry.loadEventEnd - navigationEntry.startTime
          )
        }
      })
    })

    performanceObserver.value.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
  }

  // Update all metrics
  const updateMetrics = () => {
    metrics.value.memoryUsage = getMemoryUsage()
    metrics.value.domNodes = countDOMNodes()
  }

  // Image Lazy Loading
  const lazyLoadImages = (selector: string = 'img[data-src]', options: LazyLoadOptions = {}) => {
    const defaultOptions: LazyLoadOptions = {
      rootMargin: '50px',
      threshold: 0.1,
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      ...options,
    }

    const images = document.querySelectorAll(selector)

    if (!images.length) return

    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src

          if (src) {
            img.classList.add(defaultOptions.loadingClass!)

            const imageLoader = new Image()
            imageLoader.onload = () => {
              img.src = src
              img.classList.remove(defaultOptions.loadingClass!)
              img.classList.add(defaultOptions.loadedClass!)
              img.removeAttribute('data-src')
            }

            imageLoader.onerror = () => {
              img.classList.remove(defaultOptions.loadingClass!)
              img.classList.add(defaultOptions.errorClass!)
            }

            imageLoader.src = src
          }

          imageObserver.unobserve(img)
        }
      })
    }, defaultOptions)

    images.forEach(img => imageObserver.observe(img))

    return imageObserver
  }

  // Virtual Scrolling for large lists
  const createVirtualScrolling = (container: HTMLElement, itemHeight: number, items: any[]) => {
    const containerHeight = container.clientHeight
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const bufferSize = Math.floor(visibleCount / 2)

    let scrollTop = 0
    let startIndex = 0
    let endIndex = visibleCount + bufferSize

    const updateVisibleItems = () => {
      startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
      endIndex = Math.min(items.length, startIndex + visibleCount + bufferSize * 2)

      // Return the slice of items that should be rendered
      return {
        visibleItems: items.slice(startIndex, endIndex),
        offsetY: startIndex * itemHeight,
        totalHeight: items.length * itemHeight,
      }
    }

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement
      scrollTop = target.scrollTop
      return updateVisibleItems()
    }

    return { updateVisibleItems, handleScroll }
  }

  // Debounce function for performance
  const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    return ((...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }) as T
  }

  // Throttle function for performance
  const throttle = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let lastCall = 0

    return ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        return func.apply(null, args)
      }
    }) as T
  }

  // Preload critical resources
  const preloadResource = (href: string, as: string = 'fetch', crossorigin?: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (crossorigin) link.crossOrigin = crossorigin

    document.head.appendChild(link)

    return link
  }

  // Optimize images with WebP support
  const optimizeImage = (src: string, fallback?: string): string => {
    const supportsWebP = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL('image/webp').indexOf('image/webp') === 5
    }

    if ((supportsWebP() && src.includes('.jpg')) || src.includes('.png')) {
      return src.replace(/\.(jpg|png)$/i, '.webp')
    }

    return fallback || src
  }

  // Code splitting helper
  const loadComponent = async (importFn: () => Promise<any>) => {
    try {
      const module = await importFn()
      return module.default || module
    } catch (error) {
      console.warn('Failed to load component:', error)
      throw error
    }
  }

  // Performance budget monitoring
  const checkPerformanceBudget = (budgets: {
    fps: number
    memory?: number
    domNodes: number
    renderTime: number
  }) => {
    const warnings: string[] = []

    if (metrics.value.fps < budgets.fps) {
      warnings.push(`Low FPS: ${metrics.value.fps} (budget: ${budgets.fps})`)
    }

    if (budgets.memory && metrics.value.memoryUsage && metrics.value.memoryUsage > budgets.memory) {
      warnings.push(
        `High memory usage: ${metrics.value.memoryUsage}MB (budget: ${budgets.memory}MB)`
      )
    }

    if (metrics.value.domNodes > budgets.domNodes) {
      warnings.push(`Too many DOM nodes: ${metrics.value.domNodes} (budget: ${budgets.domNodes})`)
    }

    if (metrics.value.renderTime > budgets.renderTime) {
      warnings.push(
        `Slow render time: ${metrics.value.renderTime}ms (budget: ${budgets.renderTime}ms)`
      )
    }

    return warnings
  }

  // Start monitoring
  const startMonitoring = () => {
    startFPSMonitoring()
    initPerformanceObserver()

    // Update metrics every 5 seconds
    const metricsInterval = setInterval(updateMetrics, 5000)

    // Return cleanup function
    return () => {
      clearInterval(metricsInterval)
      stopFPSMonitoring()
      if (performanceObserver.value) {
        performanceObserver.value.disconnect()
      }
    }
  }

  // Critical performance optimizations
  const applyCriticalOptimizations = () => {
    // Optimize CSS animations
    const style = document.createElement('style')
    style.textContent = `
      * {
        will-change: auto;
      }
      
      .gpu-accelerated {
        will-change: transform, opacity;
        backface-visibility: hidden;
        perspective: 1000px;
        transform: translateZ(0);
      }
      
      .smooth-scroll {
        scroll-behavior: smooth;
      }
      
      .lazy-loading {
        filter: blur(5px);
        transition: filter 0.3s ease;
      }
      
      .lazy-loaded {
        filter: none;
      }
      
      .lazy-error {
        background: #374151;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .lazy-error::after {
        content: '⚠️';
        font-size: 2rem;
      }
    `
    document.head.appendChild(style)
  }

  // Import onUnmounted for proper cleanup
  let cleanupMonitoring: (() => void) | null = null

  onMounted(() => {
    nextTick(() => {
      cleanupMonitoring = startMonitoring()
      applyCriticalOptimizations()
    })
  })

  onUnmounted(() => {
    if (cleanupMonitoring) {
      cleanupMonitoring()
    }
  })

  return {
    // State
    metrics,
    isOptimizing,

    // Monitoring
    startFPSMonitoring,
    stopFPSMonitoring,
    updateMetrics,
    checkPerformanceBudget,

    // Optimization utilities
    lazyLoadImages,
    createVirtualScrolling,
    debounce,
    throttle,
    preloadResource,
    optimizeImage,
    loadComponent,

    // Performance helpers
    startMonitoring,
    applyCriticalOptimizations,
  }
}
