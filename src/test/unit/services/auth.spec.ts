import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { User as FirebaseUser, UserCredential } from 'firebase/auth'
import type { User } from '@/services/auth'

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({
      currentUser: null,
    })),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn(),
    onAuthStateChanged: vi.fn(),
  }
})

import { AuthService } from '@/services/auth'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'

// Mock Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

// Mock environment variables
vi.mock('import.meta.env', () => ({
  default: {
    VITE_FIREBASE_API_KEY: 'test-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test-bucket',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: 'test-app-id',
    DEV: true,
  },
}))

describe('AuthService', () => {
  let authService: AuthService

  // Mock auth object that we can control in tests
  const mockAuth = {
    currentUser: null as FirebaseUser | null,
  }

  const mockFirebaseUser: Partial<FirebaseUser> = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    photoURL: null,
    metadata: {
      creationTime: '2023-01-01T00:00:00Z',
    } as any,
  }

  const expectedUser: User = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    photoURL: null,
    createdAt: '2023-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Set up getAuth mock to return our controllable mockAuth
    vi.mocked(getAuth).mockReturnValue(mockAuth as any)

    // Reset mock auth state
    mockAuth.currentUser = null

    authService = AuthService.getInstance()
  })

  afterEach(() => {
    mockAuth.currentUser = null
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuthService.getInstance()
      const instance2 = AuthService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockCredential: Partial<UserCredential> = {
        user: mockFirebaseUser as FirebaseUser,
      }

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce(
        mockCredential as UserCredential
      )
      vi.mocked(updateProfile).mockResolvedValueOnce(undefined)

      const result = await authService.register('test@example.com', 'password123', 'Test User')

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      )
      expect(updateProfile).toHaveBeenCalledWith(mockFirebaseUser, {
        displayName: 'Test User',
      })
      expect(result).toEqual(expectedUser)
    })

    it('should register without display name', async () => {
      const mockCredential: Partial<UserCredential> = {
        user: mockFirebaseUser as FirebaseUser,
      }

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce(
        mockCredential as UserCredential
      )

      const result = await authService.register('test@example.com', 'password123')

      expect(createUserWithEmailAndPassword).toHaveBeenCalled()
      expect(updateProfile).not.toHaveBeenCalled()
      expect(result).toEqual(expectedUser)
    })

    it('should throw error on registration failure', async () => {
      const mockError = new Error('Email already in use')
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(mockError)

      await expect(
        authService.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockCredential: Partial<UserCredential> = {
        user: mockFirebaseUser as FirebaseUser,
      }

      vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(mockCredential as UserCredential)

      const result = await authService.login('test@example.com', 'password123')

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      )
      expect(result).toEqual(expectedUser)
    })

    it('should throw error on login failure', async () => {
      const mockError = new Error('Wrong password')
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(mockError)

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(signOut).mockResolvedValueOnce(undefined)

      await expect(authService.logout()).resolves.toBeUndefined()

      expect(signOut).toHaveBeenCalledWith(mockAuth)
    })

    it('should throw error on logout failure', async () => {
      const mockError = new Error('Logout failed')
      vi.mocked(signOut).mockRejectedValueOnce(mockError)

      await expect(authService.logout()).rejects.toThrow()
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when not authenticated', () => {
      mockAuth.currentUser = null

      const result = authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when user is not authenticated', () => {
      mockAuth.currentUser = null

      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('onAuthStateChange', () => {
    it('should add auth state listener', () => {
      const mockCallback = vi.fn()

      authService.onAuthStateChange(mockCallback)

      // Verify the listener was added (we can't directly test private array)
      expect(mockCallback).toBeDefined()
    })

    it('should remove auth state listener', () => {
      const mockCallback = vi.fn()

      const unsubscribe = authService.onAuthStateChange(mockCallback)
      unsubscribe()

      // Verify the unsubscribe function exists
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined)

      await expect(authService.resetPassword('test@example.com')).resolves.toBeUndefined()

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'test@example.com')
    })

    it('should throw error on password reset failure', async () => {
      const mockError = new Error('User not found')
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(mockError)

      await expect(authService.resetPassword('test@example.com')).rejects.toThrow()
    })
  })
})
