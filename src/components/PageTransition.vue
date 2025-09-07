<template>
  <transition
    :name="transitionName"
    mode="out-in"
    appear
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  type?: 'fade' | 'slide-up' | 'slide-right' | 'scale' | 'cinema'
  duration?: number
  easing?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'cinema',
  duration: 500,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
})

const route = useRoute()
const isTransitioning = ref(false)

// Dynamic transition name based on route changes
const transitionName = computed(() => {
  if (props.type === 'cinema') {
    // Premium cinema-style transitions
    const routeName = route.name as string
    
    if (routeName?.includes('watch')) {
      return 'cinema-watch'
    } else if (routeName?.includes('search')) {
      return 'cinema-search'
    } else if (routeName?.includes('profile')) {
      return 'cinema-profile'
    } else {
      return 'cinema-default'
    }
  }
  
  return `page-${props.type}`
})

// Transition event handlers
const onBeforeEnter = (el: Element) => {
  isTransitioning.value = true
  const htmlEl = el as HTMLElement
  htmlEl.style.transition = `all ${props.duration}ms ${props.easing}`
}

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  // Trigger layout before animation
  htmlEl.offsetHeight
  
  setTimeout(() => {
    isTransitioning.value = false
    done()
  }, props.duration)
}

const onBeforeLeave = (el: Element) => {
  isTransitioning.value = true
  const htmlEl = el as HTMLElement
  htmlEl.style.transition = `all ${props.duration}ms ${props.easing}`
}

const onLeave = (el: Element, done: () => void) => {
  setTimeout(() => {
    done()
  }, props.duration)
}

// Watch for route changes to optimize animations
watch(() => route.path, () => {
  // Add any route-specific optimizations here
}, { flush: 'pre' })
</script>

<style scoped>
/* Cinema-style transitions */

/* Default cinema transition */
.cinema-default-enter-active,
.cinema-default-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cinema-default-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.cinema-default-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.05);
}

/* Watch page cinema transition */
.cinema-watch-enter-active,
.cinema-watch-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cinema-watch-enter-from {
  opacity: 0;
  transform: scale(0.9) rotateX(5deg);
  filter: blur(10px);
}

.cinema-watch-leave-to {
  opacity: 0;
  transform: scale(1.1) rotateX(-5deg);
  filter: blur(10px);
}

/* Search page cinema transition */
.cinema-search-enter-active,
.cinema-search-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cinema-search-enter-from {
  opacity: 0;
  transform: translateX(50px);
  filter: blur(5px);
}

.cinema-search-leave-to {
  opacity: 0;
  transform: translateX(-50px);
  filter: blur(5px);
}

/* Profile page cinema transition */
.cinema-profile-enter-active,
.cinema-profile-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cinema-profile-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
}

.cinema-profile-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(1.1);
}

/* Basic transitions */

/* Fade */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* Slide Up */
.page-slide-up-enter-active,
.page-slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-slide-up-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.page-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}

/* Slide Right */
.page-slide-right-enter-active,
.page-slide-right-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-slide-right-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.page-slide-right-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Scale */
.page-scale-enter-active,
.page-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.page-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Performance optimizations */
.cinema-default-enter-active,
.cinema-default-leave-active,
.cinema-watch-enter-active,
.cinema-watch-leave-active,
.cinema-search-enter-active,
.cinema-search-leave-active,
.cinema-profile-enter-active,
.cinema-profile-leave-active {
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>