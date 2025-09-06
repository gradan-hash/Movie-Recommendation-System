import { createPinia } from 'pinia'

// Create and export pinia instance
export const pinia = createPinia()

// Export stores
export { useMoviesStore } from './movies'
export { useUserStore } from './user'