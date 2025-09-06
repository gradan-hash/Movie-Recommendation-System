import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { useUserStore } from './stores/user'

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Mount the app
app.mount('#app')

// Initialize user store with localStorage data
const userStore = useUserStore()
userStore.loadFromLocalStorage()
