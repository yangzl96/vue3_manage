import { createRouter, createWebHashHistory } from 'vue-router'
import storage from '../utils/storage'
import Api from '../api'
import utils from '../utils/utils'

const routes = [
  {
    name: 'home',
    path: '/',
    meta: {
      title: '首页'
    },
    component: import('@/components/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        name: 'welcome',
        path: '/welcome',
        meta: {
          title: '欢迎页'
        },
        component: () => import('@/views/Welcome.vue')
      }
    ]
  },
  {
    name: 'login',
    path: '/login',
    meta: {
      title: '登录'
    },
    component: () => import('@/views/Login.vue'),
  },
  {
    name: '404',
    path: '/404',
    meta: {
      title: '页面不存在'
    },
    component: () => import('@/views/404.vue'),
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 每次 刷新页面 都会执行一次
// 登陆进来只会执行一次 必须要在登录页面保存完数据后重新调用一次

// 动态生成异步路由
async function loadAsyncRoutes () {
  let userInfo = storage.getItem('userInfo') || {}
  if (userInfo.token) {
    try {
      const { menuList } = await Api.getPermissionList()
      let routes = utils.generateRoute(JSON.parse(JSON.stringify(menuList)))
      routes.map(route => {
        let url = `../views/${route.component}.vue`
        route.component = () => import(url)
        router.addRoute('home', route)
      })
    } catch (error) {

    }
  }
}

await loadAsyncRoutes()

// 判断当前地址是否可以访问
function checkPermission (path) {
  let hasPermission = router.getRoutes().filter(route => route.path === path).length
  return hasPermission ? true : false
}

// 导航守卫
router.beforeEach((to, from, next) => {
  // checkPermission(to.path)
  if (router.hasRoute(to.name)) {
    document.title = to.meta.title
    next()
  } else {
    next('/404')
  }
})

export default router