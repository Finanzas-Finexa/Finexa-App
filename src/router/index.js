import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/login-page.vue'
import Register from '../views/register-page.vue'
import DashboardPrestamista from '../views/dashboardprestamista.vue'
import DashboardPrestatario from '../views/dashboardprestatario.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/prestamista', component: DashboardPrestamista },
  { path: '/prestatario', component: DashboardPrestatario },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
