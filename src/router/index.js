import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/horizon'),
  routes: [
    {
      path: "/",
      name: "first_page",
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/system/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/system',
      name: 'system',
      component: () => import('@/views/LayoutView.vue'),
      children: [
        {
          path: 'question',
          name: 'question',
          component: () => import('@/views/QuestionView.vue')
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/UserView.vue')
        },
        {
          path: 'contest',
          name: 'contest',
          component: () => import('@/views/ContestView.vue')
        }
      ]
    },
  ],
})

export default router
