<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    @click="closeModal"
  >
    <div 
      class="bg-gray-800 rounded-lg max-w-md w-full p-6"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">
          {{ isLoginMode ? 'Welcome Back' : 'Join CinemaAI' }}
        </h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
        <p class="text-red-200 text-sm">{{ error }}</p>
      </div>

      <!-- Success Display -->
      <div v-if="successMessage" class="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg">
        <p class="text-green-200 text-sm">{{ successMessage }}</p>
      </div>

      <!-- Auth Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Display Name (Register only) -->
        <div v-if="!isLoginMode" class="mb-4">
          <label class="block text-white text-sm font-medium mb-2">
            Full Name
          </label>
          <input
            v-model="form.displayName"
            type="text"
            required
            class="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            placeholder="Enter your full name"
            :class="{ 'border-red-500': errors.displayName }"
          />
          <p v-if="errors.displayName" class="text-red-400 text-xs mt-1">{{ errors.displayName }}</p>
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-white text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            placeholder="Enter your email"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="text-red-400 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label class="block text-white text-sm font-medium mb-2">
            Password
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              placeholder="Enter your password"
              :class="{ 'border-red-500': errors.password }"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.757 7.757M12 12l2.122-2.122m0 0L16.243 7.757"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="text-red-400 text-xs mt-1">{{ errors.password }}</p>
          <div v-if="!isLoginMode && form.password" class="mt-1">
            <div class="text-xs text-gray-400 mb-1">Password strength:</div>
            <div class="w-full bg-gray-600 rounded-full h-1">
              <div 
                class="h-1 rounded-full transition-all duration-300"
                :class="passwordStrengthColor"
                :style="{ width: passwordStrengthPercent + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Confirm Password (Register only) -->
        <div v-if="!isLoginMode" class="mb-6">
          <label class="block text-white text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            placeholder="Confirm your password"
            :class="{ 'border-red-500': errors.confirmPassword }"
          />
          <p v-if="errors.confirmPassword" class="text-red-400 text-xs mt-1">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ loading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Create Account') }}
        </button>
      </form>

      <!-- Forgot Password (Login only) -->
      <div v-if="isLoginMode" class="mt-4 text-center">
        <button
          @click="handleForgotPassword"
          class="text-red-400 hover:text-red-300 text-sm"
        >
          Forgot your password?
        </button>
      </div>

      <!-- Mode Switch -->
      <div class="mt-6 text-center">
        <p class="text-gray-400 text-sm">
          {{ isLoginMode ? "Don't have an account?" : 'Already have an account?' }}
          <button
            @click="toggleMode"
            class="text-red-400 hover:text-red-300 font-semibold ml-1"
          >
            {{ isLoginMode ? 'Sign up' : 'Sign in' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { AuthService } from '@/services/auth'

interface Props {
  isOpen: boolean
  initialMode?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  initialMode: 'login'
})

const emit = defineEmits<{
  close: []
  success: [type: 'login' | 'register' | 'reset']
}>()

// Store
const userStore = useUserStore()

// State
const isLoginMode = ref(props.initialMode === 'login')
const loading = ref(false)
const showPassword = ref(false)
const error = ref('')
const successMessage = ref('')

// Form data
const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  displayName: ''
})

// Form errors
const errors = ref({
  email: '',
  password: '',
  confirmPassword: '',
  displayName: ''
})

// Computed
const isFormValid = computed(() => {
  if (isLoginMode.value) {
    return form.value.email && form.value.password && !errors.value.email && !errors.value.password
  } else {
    return (
      form.value.email &&
      form.value.password &&
      form.value.confirmPassword &&
      form.value.displayName &&
      !Object.values(errors.value).some(error => error)
    )
  }
})

const passwordStrength = computed(() => {
  const password = form.value.password
  let score = 0
  
  if (password.length >= 8) score += 1
  if (/(?=.*[a-z])/.test(password)) score += 1
  if (/(?=.*[A-Z])/.test(password)) score += 1
  if (/(?=.*\d)/.test(password)) score += 1
  if (/(?=.*[!@#$%^&*])/.test(password)) score += 1
  
  return score
})

const passwordStrengthPercent = computed(() => (passwordStrength.value / 5) * 100)

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'bg-red-500'
  if (strength <= 2) return 'bg-yellow-500'
  if (strength <= 3) return 'bg-blue-500'
  return 'bg-green-500'
})

// Watchers for validation
watch(() => form.value.email, (email) => {
  if (email && !AuthService.isValidEmail(email)) {
    errors.value.email = 'Please enter a valid email address'
  } else {
    errors.value.email = ''
  }
})

watch(() => form.value.password, (password) => {
  if (password && !isLoginMode.value) {
    const validation = AuthService.isValidPassword(password)
    errors.value.password = validation.valid ? '' : validation.message || ''
  } else {
    errors.value.password = ''
  }
})

watch(() => form.value.confirmPassword, (confirmPassword) => {
  if (confirmPassword && confirmPassword !== form.value.password) {
    errors.value.confirmPassword = 'Passwords do not match'
  } else {
    errors.value.confirmPassword = ''
  }
})

watch(() => form.value.displayName, (displayName) => {
  if (displayName && displayName.trim().length < 2) {
    errors.value.displayName = 'Name must be at least 2 characters'
  } else {
    errors.value.displayName = ''
  }
})

// Methods
const resetForm = () => {
  form.value = {
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  }
  errors.value = {
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  }
  error.value = ''
  successMessage.value = ''
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  resetForm()
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (isLoginMode.value) {
      await userStore.login(form.value.email, form.value.password)
      successMessage.value = 'Successfully logged in!'
      emit('success', 'login')
      setTimeout(() => {
        closeModal()
      }, 1500)
    } else {
      await userStore.register(form.value.email, form.value.password, form.value.displayName)
      successMessage.value = 'Account created successfully!'
      emit('success', 'register')
      setTimeout(() => {
        closeModal()
      }, 1500)
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!form.value.email) {
    error.value = 'Please enter your email address first'
    return
  }

  if (!AuthService.isValidEmail(form.value.email)) {
    error.value = 'Please enter a valid email address'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await userStore.resetPassword(form.value.email)
    successMessage.value = 'Password reset email sent! Check your inbox.'
    emit('success', 'reset')
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
    isLoginMode.value = props.initialMode === 'login'
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>