import { beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Create a fresh Pinia instance for each test
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mock environment variables globally
vi.mock('import.meta', () => ({
  env: {
    VITE_FIREBASE_API_KEY: 'test-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test-bucket',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: 'test-app-id',
    VITE_TMDB_API_KEY: 'test-tmdb-key',
    VITE_TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    VITE_API_Read_Access_Token: 'test-token',
    VITE_APP_TITLE: 'Test App',
    DEV: true,
  },
}))

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
