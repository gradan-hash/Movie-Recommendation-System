import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { authService } from '@/services/auth'
import WatchView from '../views/WatchView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // Future routes for interview expansion
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue')
    },
    {
      path: '/favorites',
      name: 'favorites', 
      component: () => import('@/views/FavoritesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/movie/:id',
      name: 'movie-details',
      component: () => import('@/views/MovieDetailView.vue'),
      props: true
    },
    {
      path: '/watch/movie/:id',
      name: 'watch-movie',
      component: WatchView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/watch/series/:id',
      name: 'watch-series',
      component: WatchView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: () => import('@/views/RecommendationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    // 404 handling
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Route guards
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authService.isAuthenticated()

  if (requiresAuth && !isAuthenticated) {
    // Redirect to home with a query parameter to indicate auth is needed
    next({ 
      name: 'home', 
      query: { 
        redirect: to.fullPath,
        auth: 'required'
      } 
    })
  } else {
    next()
  }
})

export default router