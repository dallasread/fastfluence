import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Page from '../components/Page.vue'

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/pages/:id',
    component: Page
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
