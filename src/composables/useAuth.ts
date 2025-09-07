import { inject, provide, ref, type InjectionKey } from 'vue'

// Auth modal state interface
interface AuthModalState {
  isOpen: boolean
  mode: 'login' | 'register'
  message?: string
}

// Auth modal methods interface  
interface AuthModalMethods {
  openLogin: (message?: string) => void
  openRegister: (message?: string) => void
  close: () => void
}

// Combined interface
interface AuthModal extends AuthModalState, AuthModalMethods {}

// Injection key
const AuthModalKey: InjectionKey<AuthModal> = Symbol('AuthModal')

// Provider composable (used in App.vue)
export function provideAuthModal() {
  const isOpen = ref(false)
  const mode = ref<'login' | 'register'>('login')
  const message = ref<string>()

  const openLogin = (msg?: string) => {
    mode.value = 'login'
    message.value = msg
    isOpen.value = true
  }

  const openRegister = (msg?: string) => {
    mode.value = 'register'
    message.value = msg
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    message.value = undefined
  }

  const authModal: AuthModal = {
    isOpen: isOpen.value,
    mode: mode.value,
    message: message.value,
    openLogin,
    openRegister,
    close
  }

  provide(AuthModalKey, authModal)

  return {
    isOpen,
    mode,
    message,
    openLogin,
    openRegister,
    close
  }
}

// Consumer composable (used in other components)
export function useAuxthModal() {
  const authModal = inject(AuthModalKey)
  
  if (!authModal) {
    throw new Error('useAuthModal must be used within a component that has provideAuthModal')
  }
  
  return authModal
}

// Authentication check composable
export function useAuthCheck() {
  const requireAuth = (action: string = 'perform this action') => {
    // This will be used to check authentication and show modal if needed
    return {
      withAuth: (callback: () => void) => {
        // The component using this will handle the auth check
        return callback
      },
      message: `Please sign in to ${action}`
    }
  }

  return {
    requireAuth
  }
}