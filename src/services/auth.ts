import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Debug Firebase configuration in development
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config Check:', {
    apiKey: firebaseConfig.apiKey ? `✓ ${firebaseConfig.apiKey.substring(0, 10)}...` : '❌ Missing',
    authDomain: firebaseConfig.authDomain || '❌ Missing',
    projectId: firebaseConfig.projectId || '❌ Missing',
    storageBucket: firebaseConfig.storageBucket || '❌ Missing',
    messagingSenderId: firebaseConfig.messagingSenderId || '❌ Missing',
    appId: firebaseConfig.appId ? `✓ ${firebaseConfig.appId.substring(0, 20)}...` : '❌ Missing'
  })
  
  console.log('🔧 Environment Variables:', {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Found' : '❌ Not Found',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Found' : '❌ Not Found',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Found' : '❌ Not Found',
    NODE_ENV: import.meta.env.MODE,
    DEV: import.meta.env.DEV
  })
}

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  const errorMessage = `❌ Firebase configuration is incomplete:
    - API Key: ${firebaseConfig.apiKey ? '✓' : '❌'}
    - Auth Domain: ${firebaseConfig.authDomain ? '✓' : '❌'}
    - Project ID: ${firebaseConfig.projectId ? '✓' : '❌'}
  `
  console.error(errorMessage)
  throw new Error('Firebase configuration error. Check console for details.')
}

console.log('✅ Firebase configuration validated successfully')

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// User interface for our app
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt?: string
}

// Auth service class
export class AuthService {
  private static instance: AuthService
  private authStateListeners: Array<(user: User | null) => void> = []

  private constructor() {
    // Set up auth state listener
    onAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null
      this.authStateListeners.forEach(listener => listener(user))
    })
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Map Firebase user to our User interface
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata.creationTime
    }
  }

  // Register new user
  async register(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName })
      }

      const user = this.mapFirebaseUser(userCredential.user)
      console.log('✅ User registered successfully:', user.email)
      return user
    } catch (error: any) {
      console.error('❌ Registration failed:', error.message)
      throw this.handleAuthError(error)
    }
  }

  // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = this.mapFirebaseUser(userCredential.user)
      console.log('✅ User logged in successfully:', user.email)
      return user
    } catch (error: any) {
      console.error('❌ Login failed:', error.message)
      throw this.handleAuthError(error)
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth)
      console.log('✅ User logged out successfully')
    } catch (error: any) {
      console.error('❌ Logout failed:', error.message)
      throw this.handleAuthError(error)
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth.currentUser !== null
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
      console.log('✅ Password reset email sent')
    } catch (error: any) {
      console.error('❌ Password reset failed:', error.message)
      throw this.handleAuthError(error)
    }
  }

  // Update user profile
  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error('No user is currently signed in')

    try {
      await updateProfile(user, { displayName, photoURL })
      console.log('✅ Profile updated successfully')
    } catch (error: any) {
      console.error('❌ Profile update failed:', error.message)
      throw this.handleAuthError(error)
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  // Handle Firebase auth errors
  private handleAuthError(error: any): Error {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'This email is already registered. Please use a different email or try logging in.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'No account found with this email. Please check your email or create a new account.',
      'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
      'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
      'auth/requires-recent-login': 'Please log in again to perform this action.'
    }

    const message = errorMessages[error.code] || error.message || 'An unexpected error occurred'
    return new Error(message)
  }

  // Utility: Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Utility: Validate password strength
  static isValidPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' }
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' }
    }
    return { valid: true }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()