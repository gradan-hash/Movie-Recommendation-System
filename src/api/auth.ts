import { auth } from '@/services/auth'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'

// API Response types
export interface AuthResponse {
  success: boolean
  data?: {
    uid: string
    email: string | null
    displayName: string | null
    emailVerified: boolean
  }
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName?: string
}

export interface ResetPasswordRequest {
  email: string
}

// Auth API endpoints
export class AuthAPI {
  /**
   * Login endpoint
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      )

      const user = userCredential.user

      return {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      }
    }
  }

  /**
   * Register endpoint
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )

      const user = userCredential.user

      // Update profile with display name if provided
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName,
        })
      }

      return {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          displayName: userData.displayName || user.displayName,
          emailVerified: user.emailVerified,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      }
    }
  }

  /**
   * Logout endpoint
   */
  static async logout(): Promise<AuthResponse> {
    try {
      await signOut(auth)

      return {
        success: true,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      }
    }
  }

  /**
   * Reset password endpoint
   */
  static async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      await sendPasswordResetEmail(auth, request.email)

      return {
        success: true,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      }
    }
  }

  /**
   * Get current user endpoint
   */
  static getCurrentUser(): AuthResponse {
    try {
      const user = auth.currentUser

      if (user) {
        return {
          success: true,
          data: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
          },
        }
      } else {
        return {
          success: false,
          error: 'No authenticated user',
        }
      }
    } catch (error: any) {
      console.warn(error)
      return {
        success: false,
        error: 'Failed to get current user',
      }
    }
  }

  /**
   * Update user profile endpoint
   */
  static async updateProfile(displayName?: string, photoURL?: string): Promise<AuthResponse> {
    try {
      const user = auth.currentUser

      if (!user) {
        return {
          success: false,
          error: 'No authenticated user',
        }
      }

      await updateProfile(user, { displayName, photoURL })

      return {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          displayName: displayName || user.displayName,
          emailVerified: user.emailVerified,
        },
      }
    } catch (error: any) {
      console.error('❌ API: Profile update failed:', error.message)

      return {
        success: false,
        error: 'Failed to update profile',
      }
    }
  }

  /**
   * Convert Firebase auth errors to user-friendly messages
   */
  private static getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use':
        'This email is already registered. Please use a different email or sign in.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found':
        'No account found with this email. Please check your email or create a new account.',
      'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
      'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
      'auth/requires-recent-login': 'Please log in again to perform this action.',
      'auth/configuration-not-found':
        'Firebase configuration error. Please check your Firebase setup.',
      'auth/invalid-api-key': 'Invalid Firebase API key. Please check your configuration.',
      'auth/missing-android-pkg-name': 'Missing Android package name.',
      'auth/missing-continue-uri': 'Missing continue URL.',
      'auth/missing-ios-bundle-id': 'Missing iOS bundle ID.',
      'auth/invalid-continue-uri': 'Invalid continue URL.',
      'auth/unauthorized-continue-uri': 'Unauthorized continue URL.',
    }

    return errorMessages[errorCode] || `Authentication error: ${errorCode}`
  }

  /**
   * Check if Firebase is properly configured
   */
  static checkConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      const app = auth.app

      if (!app.options.apiKey) {
        errors.push('Missing Firebase API key')
      }

      if (!app.options.authDomain) {
        errors.push('Missing Firebase auth domain')
      }

      if (!app.options.projectId) {
        errors.push('Missing Firebase project ID')
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    } catch (error) {
      console.error('❌ API: Configuration check failed:', error)

      return {
        isValid: false,
        errors: ['Failed to check Firebase configuration'],
      }
    }
  }
}

// Export convenience functions for direct use
export const loginUser = AuthAPI.login
export const registerUser = AuthAPI.register
export const logoutUser = AuthAPI.logout
export const resetUserPassword = AuthAPI.resetPassword
export const getCurrentUser = AuthAPI.getCurrentUser
export const updateUserProfile = AuthAPI.updateProfile
export const checkFirebaseConfig = AuthAPI.checkConfiguration
