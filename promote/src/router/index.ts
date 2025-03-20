import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { userStore } from '../store/user'
import { message } from 'ant-design-vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'layout',
    component: () => import('../view/Homeview.vue'),
    children: [
      {
        path: '/index',
        name: 'home',
        component: () => import('../view/IndexView.vue'),
        meta: { title: '首页' }
      },
      {
        path: '/multipleChoice',
        name: 'multipleChoice',
        component: () => import('../view/MultipleChoiceView.vue'),
        meta: { title: '选择题', requiresAuth: true }
      },
      {
        path: '/contest',
        name: 'contest',
        component: () => import('../view/ContestView.vue'),
        meta: { title: '竞赛', requiresAuth: true }
      },
      {
        path: '/analysis',
        name: 'analysis',
        component: () => import('../view/AnalysisView.vue'),
        meta: { title: '分析', requiresAuth: true }
      },
      {
        path: '/discuss',
        name: 'discuss',
        component: () => import('../view/DiscussView.vue'),
        meta: { title: '讨论' }
      },
      {
        path: '/user',
        name: 'user',
        component: () => import('../view/UserView.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: '/admin',
        name: 'admin',
        component: () => import('../view/AdminView.vue'),
        meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true }
      }
    ],
    redirect: '/index'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../view/LoginAndSignView.vue'),
    meta: { title: '登录/注册' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/index'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 刷题助手` : '刷题助手'
  
  // 检查是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.state.isLoggedIn) {
      message.warning('请先登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 检查是否需要管理员权限
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (userStore.state.role !== '管理员') {
      message.warning('此页面需要管理员权限')
      next({ path: '/index' })
      return
    }
  }
  
  next()
})

export default router