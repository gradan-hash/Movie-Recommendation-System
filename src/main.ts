import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { useUserStore } from './stores/user'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faHome,
  faRobot,
  faUser,
  faSignInAlt,
  faUserPlus,
  faSignOutAlt,
  faFilm,
  faInfoCircle,
  faEnvelope,
  faGlobe,
  faMobile,
  faStar,
  faHeart,
  faSearch,
  faBan,
  faExclamationTriangle,
  faLightbulb,
  faTimes,
  faLink,
  faCheckCircle,
  faTimesCircle,
  faChevronLeft,
  faChevronRight,
  faVolumeUp,
  faVolumeMute,
  faFire,
  faBolt,
  faLaugh,
  faMasksTheater,
  faGhost,
  faTv,
  faPlay,
  faPause,
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
  faHome,
  faRobot,
  faUser,
  faSignInAlt,
  faUserPlus,
  faSignOutAlt,
  faFilm,
  faInfoCircle,
  faEnvelope,
  faGlobe,
  faMobile,
  faStar,
  faHeart,
  faSearch,
  faBan,
  faExclamationTriangle,
  faLightbulb,
  faTimes,
  faLink,
  faCheckCircle,
  faTimesCircle,
  faChevronLeft,
  faChevronRight,
  faVolumeUp,
  faVolumeMute,
  faFire,
  faBolt,
  faLaugh,
  faMasksTheater,
  faGhost,
  faTv,
  faPlay,
  faPause
)

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Mount the app
app.mount('#app')

// Initialize user store with authentication and localStorage data
const userStore = useUserStore()
userStore.initializeAuth()
userStore.loadFromLocalStorage()
