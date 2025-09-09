<template>
  <!-- Toast Container -->
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[10000] space-y-2">
      <transition-group name="toast" tag="div" class="space-y-2" appear>
        <div
          v-for="notification in toast.notifications.value"
          :key="notification.id"
          class="toast-item"
          :class="getToastClasses(notification.type)"
          @click="handleToastClick(notification)"
        >
          <!-- Toast Content -->
          <div class="flex items-start gap-3">
            <!-- Toast Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm animate-bounce-gentle"
                :class="getIconClasses(notification.type)"
              >
                {{ notification.icon }}
              </div>
            </div>

            <!-- Toast Text -->
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-sm" :class="getTitleClasses(notification.type)">
                {{ notification.title }}
              </h4>
              <p
                v-if="notification.message"
                class="text-xs mt-1 opacity-90"
                :class="getMessageClasses(notification.type)"
              >
                {{ notification.message }}
              </p>
            </div>

            <!-- Action Button -->
            <div v-if="notification.action" class="flex-shrink-0">
              <button
                @click.stop="notification.action.onClick()"
                class="text-xs font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors"
                :class="getActionClasses(notification.type)"
              >
                {{ notification.action.label }}
              </button>
            </div>

            <!-- Close Button -->
            <button
              @click.stop="toast.removeNotification(notification.id)"
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
              :class="getCloseClasses(notification.type)"
            >
              <svg
                class="w-3 h-3 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Progress Bar -->
          <div
            v-if="(notification.duration ?? 0) > 0"
            class="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full transition-all duration-300 ease-linear"
            :class="getProgressClasses(notification.type)"
            :style="{
              width: `${getProgressWidth(notification)}%`,
              animationDuration: `${notification.duration}ms`,
            }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { globalToast, type ToastNotification } from '@/services/toast'

// State
const toast = globalToast
let progressInterval: number | null = null

// Computed
const getProgressWidth = (notification: ToastNotification): number => {
  const duration = notification.duration ?? 0
  if (duration <= 0) return 100

  const elapsed = Date.now() - notification.createdAt
  const remaining = Math.max(0, duration - elapsed)
  return (remaining / duration) * 100
}

// Methods
const handleToastClick = (_notification: {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number | undefined
  icon?: string | undefined
  action?: { label: string; onClick: () => void } | undefined
  createdAt: number
}) => {
  // Optionally, you can implement custom behavior here, such as dismissing the toast on click.
  // For now, do nothing or remove the toast if desired:
  // toast.removeNotification(notification.id)
}

const getToastClasses = (type: ToastNotification['type']): string => {
  const baseClasses =
    'relative overflow-hidden min-w-80 max-w-96 p-4 rounded-xl shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl'

  const typeClasses = {
    success: 'bg-green-500/90 border border-green-400/50',
    error: 'bg-red-500/90 border border-red-400/50',
    warning: 'bg-yellow-500/90 border border-yellow-400/50',
    info: 'bg-blue-500/90 border border-blue-400/50',
  }

  return `${baseClasses} ${typeClasses[type]}`
}

const getIconClasses = (type: ToastNotification['type']): string => {
  const typeClasses = {
    success: 'bg-green-600/80 text-white',
    error: 'bg-red-600/80 text-white',
    warning: 'bg-yellow-600/80 text-white',
    info: 'bg-blue-600/80 text-white',
  }

  return typeClasses[type]
}

const getTitleClasses = (_type: ToastNotification['type']): string => {
  return 'text-white'
}

const getMessageClasses = (_type: ToastNotification['type']): string => {
  return 'text-white/90'
}

const getActionClasses = (_type: ToastNotification['type']): string => {
  return 'text-white/90 hover:text-white'
}

const getCloseClasses = (_type: ToastNotification['type']): string => {
  return 'text-white/70 hover:text-white'
}

const getProgressClasses = (type: ToastNotification['type']): string => {
  const typeClasses = {
    success: 'bg-green-300/80',
    error: 'bg-red-300/80',
    warning: 'bg-yellow-300/80',
    info: 'bg-blue-300/80',
  }

  return `toast-progress ${typeClasses[type]}`
}

// Update progress bars
const updateProgress = () => {
  // Force reactivity update for progress bars
  // This is handled by the computed property automatically
}

// Lifecycle
onMounted(() => {
  // Update progress bars every 100ms for smooth animation
  progressInterval = window.setInterval(updateProgress, 100)
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
/* Toast animations */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Custom animations */
@keyframes bounce-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.toast-progress {
  animation: progress-shrink linear;
}

/* Hover effects */
.toast-item:hover .animate-bounce-gentle {
  animation-play-state: paused;
}

/* Responsive */
@media (max-width: 480px) {
  .toast-item {
    min-width: calc(100vw - 2rem);
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }
}
</style>
