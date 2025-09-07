import { ref, onMounted, onUnmounted } from 'vue'

interface SmoothScrollOptions {
  duration?: number
  easing?: (t: number) => number
  offset?: number
}

// Easing functions for smooth animations
const easingFunctions = {
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
}

export const useSmoothScroll = (options: SmoothScrollOptions = {}) => {
  const {
    duration = 800,
    easing = easingFunctions.easeInOutCubic,
    offset = 0
  } = options

  const isScrolling = ref(false)
  const scrollProgress = ref(0)

  let animationFrame: number | null = null

  // Smooth scroll to element
  const scrollToElement = (element: Element | string, customOptions?: SmoothScrollOptions) => {
    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) 
      : element

    if (!targetElement) {
      console.warn('Smooth scroll: Target element not found')
      return
    }

    const rect = targetElement.getBoundingClientRect()
    const targetY = window.scrollY + rect.top - (customOptions?.offset || offset)

    scrollTo(targetY, customOptions)
  }

  // Smooth scroll to position
  const scrollTo = (targetY: number, customOptions?: SmoothScrollOptions) => {
    if (isScrolling.value && animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    const startY = window.scrollY
    const distance = targetY - startY
    const customDuration = customOptions?.duration || duration
    const customEasing = customOptions?.easing || easing

    let startTime: number | null = null

    isScrolling.value = true
    scrollProgress.value = 0

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime

      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / customDuration, 1)

      scrollProgress.value = progress

      const easedProgress = customEasing(progress)
      const currentY = startY + distance * easedProgress

      window.scrollTo(0, currentY)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateScroll)
      } else {
        isScrolling.value = false
        scrollProgress.value = 1
        animationFrame = null
      }
    }

    animationFrame = requestAnimationFrame(animateScroll)
  }

  // Scroll to top
  const scrollToTop = (customOptions?: SmoothScrollOptions) => {
    scrollTo(0, customOptions)
  }

  // Scroll to bottom
  const scrollToBottom = (customOptions?: SmoothScrollOptions) => {
    const targetY = document.documentElement.scrollHeight - window.innerHeight
    scrollTo(targetY, customOptions)
  }

  // Cancel current scroll animation
  const cancelScroll = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
      isScrolling.value = false
    }
  }

  // Auto-scroll functionality for showcasing content
  const autoScroll = (elements: (Element | string)[], delay: number = 3000) => {
    let currentIndex = 0
    let autoScrollInterval: number | null = null

    const startAutoScroll = () => {
      autoScrollInterval = window.setInterval(() => {
        if (currentIndex < elements.length) {
          scrollToElement(elements[currentIndex], { duration: 1200 })
          currentIndex++
        } else {
          stopAutoScroll()
        }
      }, delay)
    }

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval)
        autoScrollInterval = null
        currentIndex = 0
      }
    }

    return { startAutoScroll, stopAutoScroll }
  }

  // Parallax scroll effect
  const parallaxScroll = (elements: Array<{ element: Element | string; speed: number }>) => {
    const handleScroll = () => {
      if (isScrolling.value) return

      const scrollY = window.scrollY

      elements.forEach(({ element, speed }) => {
        const el = typeof element === 'string' 
          ? document.querySelector(element) as HTMLElement
          : element as HTMLElement

        if (el) {
          const yPos = -(scrollY * speed)
          el.style.transform = `translate3d(0, ${yPos}px, 0)`
        }
      })
    }

    return { handleScroll }
  }

  // Intersection-based reveal animations
  const revealOnScroll = (elements: (Element | string)[], options: IntersectionObserverInit = {}) => {
    const defaultOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.classList.add('reveal-animate')
          observer.unobserve(el)
        }
      })
    }, defaultOptions)

    elements.forEach((element) => {
      const el = typeof element === 'string' 
        ? document.querySelector(element) 
        : element

      if (el) {
        el.classList.add('reveal-ready')
        observer.observe(el)
      }
    })

    return observer
  }

  // Performance optimization: throttle scroll events
  const throttle = (func: Function, delay: number) => {
    let timeoutId: number | null = null
    let lastExecTime = 0

    return (...args: any[]) => {
      const currentTime = Date.now()

      if (currentTime - lastExecTime > delay) {
        func.apply(null, args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => {
          func.apply(null, args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cancelScroll()
  })

  return {
    // State
    isScrolling,
    scrollProgress,

    // Main functions
    scrollToElement,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    cancelScroll,

    // Advanced functions
    autoScroll,
    parallaxScroll,
    revealOnScroll,

    // Utilities
    throttle,
    easingFunctions
  }
}

// CSS classes for reveal animations
export const revealAnimationCSS = `
.reveal-ready {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.reveal-animate {
  opacity: 1;
  transform: translateY(0);
}

.reveal-ready.reveal-from-left {
  transform: translateX(-30px);
}

.reveal-ready.reveal-from-right {
  transform: translateX(30px);
}

.reveal-ready.reveal-scale {
  transform: scale(0.9);
}

.reveal-animate.reveal-scale {
  transform: scale(1);
}
`