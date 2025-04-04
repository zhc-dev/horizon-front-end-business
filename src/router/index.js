import { getToken } from '@/utils/cookie'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/horizon'),
  routes: [
    {
      path: '/',
      redirect: '/system/login'
    },
    {
      path: '/system/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/system/test',
      name: 'test',
      component: () => import('@/views/TestView.vue')
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

router.beforeEach((to, from, next) => {
  if (getToken()) {
    if (to.path === '/system/login') {
      next({ path: '/system/question' })
    } else {
      next();
    }
  } else {
    if (to.path !== '/system/login') {
      next({ path: '/system/login' })
    } else {
      next();
    }
  }
})

export default router
