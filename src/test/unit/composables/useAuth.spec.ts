import { describe, it, expect } from 'vitest'
import { provideAuthModal, useAuxthModal } from '@/composables/useAuth'
import { createApp, h } from 'vue'

describe('Auth Modal Composables', () => {
  describe('provideAuthModal', () => {
    it('should initialize with default state', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      expect(authModal.isOpen.value).toBe(false)
      expect(authModal.mode.value).toBe('login')
      expect(authModal.message.value).toBeUndefined()
    })

    it('should open login modal', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      authModal.openLogin('Please log in')

      expect(authModal.isOpen.value).toBe(true)
      expect(authModal.mode.value).toBe('login')
      expect(authModal.message.value).toBe('Please log in')
    })

    it('should open register modal', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      authModal.openRegister('Please register')

      expect(authModal.isOpen.value).toBe(true)
      expect(authModal.mode.value).toBe('register')
      expect(authModal.message.value).toBe('Please register')
    })

    it('should close modal', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      // Open modal first
      authModal.openLogin('Test message')
      expect(authModal.isOpen.value).toBe(true)

      // Close modal
      authModal.close()

      expect(authModal.isOpen.value).toBe(false)
      expect(authModal.message.value).toBeUndefined()
    })

    it('should handle open without message', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      authModal.openLogin()

      expect(authModal.isOpen.value).toBe(true)
      expect(authModal.mode.value).toBe('login')
      expect(authModal.message.value).toBeUndefined()
    })
  })

  describe('useAuxthModal', () => {
    it('should throw error when not provided', () => {
      const TestComponent = {
        setup() {
          expect(() => useAuxthModal()).toThrow('useAuthModal must be used within a component')
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)
    })

    it('should return provided auth modal within component tree', () => {
      let injectedModal: any

      const ChildComponent = {
        setup() {
          injectedModal = useAuxthModal()
          return () => null
        },
      }

      const ParentComponent = {
        setup() {
          provideAuthModal()
          return () => h(ChildComponent)
        },
      }

      const app = createApp(ParentComponent)
      const div = document.createElement('div')
      app.mount(div)

      expect(injectedModal).toBeDefined()
      expect(injectedModal.openLogin).toBeDefined()
      expect(injectedModal.openRegister).toBeDefined()
      expect(injectedModal.close).toBeDefined()
    })
  })

  describe('modal state management', () => {
    it('should switch between login and register modes', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      // Start with login
      authModal.openLogin('Login message')
      expect(authModal.mode.value).toBe('login')
      expect(authModal.message.value).toBe('Login message')

      // Switch to register
      authModal.openRegister('Register message')
      expect(authModal.mode.value).toBe('register')
      expect(authModal.message.value).toBe('Register message')
      expect(authModal.isOpen.value).toBe(true) // Should remain open
    })

    it('should preserve open state when switching modes', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      authModal.openLogin()
      expect(authModal.isOpen.value).toBe(true)

      authModal.openRegister()
      expect(authModal.isOpen.value).toBe(true)
    })

    it('should clear message on close', () => {
      let authModal: any

      const TestComponent = {
        setup() {
          authModal = provideAuthModal()
          return () => null
        },
      }

      const app = createApp(TestComponent)
      const div = document.createElement('div')
      app.mount(div)

      authModal.openLogin('Test message')
      expect(authModal.message.value).toBe('Test message')

      authModal.close()
      expect(authModal.message.value).toBeUndefined()
    })
  })
})
