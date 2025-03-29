import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/horizon'),
  routes: [
    {
      path: '/system/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/system',
      name: 'system',
      component: () => import('@/views/SystemView.vue')
    },
    {
      path: '/layout',
      name: 'layout',
      component: () => import('@/views/LayoutView.vue')
    }
  ],
})

export default router
