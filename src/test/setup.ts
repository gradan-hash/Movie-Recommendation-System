import { beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Create a fresh Pinia instance for each test
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mock Firebase
const mockFirebase = {
  auth: () => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  }),
  initializeApp: vi.fn(),
}

vi.mock('firebase/app', () => ({
  initializeApp: mockFirebase.initializeApp,
}))

vi.mock('firebase/auth', () => ({
  getAuth: mockFirebase.auth,
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
    query: {},
    path: '/',
  }),
}))
