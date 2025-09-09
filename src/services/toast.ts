import { ref, computed } from 'vue'

export interface ToastNotification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
  createdAt: number
}

// Global toast state
const notifications = ref<ToastNotification[]>([])
const maxNotifications = 5

export const useToast = () => {
  // Computed
  const visibleNotifications = computed(() => notifications.value.slice(0, maxNotifications))

  const hasNotifications = computed(() => notifications.value.length > 0)

  // Methods
  const addNotification = (notification: Omit<ToastNotification, 'id' | 'createdAt'>): string => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000,
      createdAt: Date.now(),
    }

    // Add to beginning of array (newest first)
    notifications.value.unshift(newNotification)

    // Remove oldest notifications if we exceed max
    if (notifications.value.length > maxNotifications) {
      notifications.value = notifications.value.slice(0, maxNotifications)
    }

    // Auto-remove after duration
    if ((newNotification.duration ?? 0) > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration!)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  // Convenience methods for different types
  const success = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({
      title,
      message: message || '',
      type: 'success',
      icon: '🎉',
      ...options,
    })
  }

  const error = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({
      title,
      message: message || '',
      type: 'error',
      icon: '❌',
      duration: 6000, // Longer duration for errors
      ...options,
    })
  }

  const warning = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({
      title,
      message: message || '',
      type: 'warning',
      icon: '⚠️',
      ...options,
    })
  }

  const info = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({
      title,
      message: message || '',
      type: 'info',
      icon: '💡',
      ...options,
    })
  }

  // Auth-specific notifications
  const loginSuccess = (userName?: string) => {
    return success(
      'Welcome back!',
      userName ? `Good to see you again, ${userName}` : "You're successfully logged in",
      {
        icon: '🎬',
        duration: 3000,
      }
    )
  }

  const registerSuccess = (userName?: string) => {
    return success(
      'Account created!',
      userName ? `Welcome to CinemaAI, ${userName}!` : 'Your account has been created successfully',
      {
        icon: '🍿',
        duration: 4000,
      }
    )
  }

  const logoutSuccess = () => {
    return info('Goodbye!', "You've been signed out successfully", {
      icon: '👋',
      duration: 2500,
    })
  }

  const authError = (message: string) => {
    return error('Authentication Failed', message, {
      icon: '🔐',
      duration: 5000,
    })
  }

  // API-specific notifications
  const apiError = (operation: string, message?: string) => {
    return error(`${operation} Failed`, message || 'Something went wrong. Please try again.', {
      icon: '🌐',
      duration: 5000,
    })
  }

  const movieLiked = (movieTitle: string) => {
    return success('Movie Liked!', `Added "${movieTitle}" to your favorites`, {
      icon: '❤️',
      duration: 2500,
    })
  }

  const movieUnliked = (movieTitle: string) => {
    return info('Movie Removed', `Removed "${movieTitle}" from favorites`, {
      icon: '💔',
      duration: 2500,
    })
  }

  return {
    // State
    notifications: visibleNotifications,
    hasNotifications,

    // Methods
    addNotification,
    removeNotification,
    clearAllNotifications,

    // Type convenience methods
    success,
    error,
    warning,
    info,

    // Auth convenience methods
    loginSuccess,
    registerSuccess,
    logoutSuccess,
    authError,

    // API convenience methods
    apiError,
    movieLiked,
    movieUnliked,
  }
}

// Global toast instance
export const globalToast = useToast()
