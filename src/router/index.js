import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/login-page.vue'
import Register from '../views/register-page.vue'
import DashboardPrestamista from '../views/dashboardprestamista.vue'
import DashboardPrestatario from '../views/dashboardprestatario.vue'
import Createbond from "@/views/createbond.vue";
import resultsemisor from "@/views/resultsemisor.vue";
import editbond from "@/views/editbond.vue";

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/emisor', component: DashboardPrestamista },
  { path: '/inversor', component: DashboardPrestatario },
  { path: '/createbond', component: Createbond },
  { path: '/resultemisor/:id', component: resultsemisor, props: true },
  { path: '/editbond/:id', component: editbond, props: true }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
