import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(
  /* webpackChunkName: "pagePag1" */
  '../components/login.vue'
)
const Home = () => import(
  /* webpackChunkName: "pagePag1" */
  '../components/Home.vue'
)
const Welcome = () => import(
  /* webpackChunkName: "pagePag1" */
  '../components/Welcome.vue'
)
const Permissionlist = () => import(
  /* webpackChunkName: "pagePag2" */
  '../components/authorityManagement/PermissionList.vue'
)
const UserRoleList = () => import(
  /* webpackChunkName: "pagePag2" */
  '../components/authorityManagement/UserRoleList.vue'
)
const Users = () => import(
  /* webpackChunkName: "pagePag3" */
  '../components/userManagement/Users.vue'
)
const Cate = () => import(
  /* webpackChunkName: "pagePag4" */
  '../components/goodsCate/Cate.vue'
)
const GoodsParams = () => import(
  /* webpackChunkName: "pagePag4" */
  '../components/goodsCate/Params.vue'
)
const GoodsLIst = () => import(
  /* webpackChunkName: "pagePag4" */
  '../components/goodsCate/List.vue'
)
const GoodsAdd = () => import(
  /* webpackChunkName: "pagePag4" */
  '../components/goodsCate/add.vue'
)
const Order = () => import(
  /* webpackChunkName: "pagePag5" */
  '../components/order/Order.vue'
)
const Report = () => import(
  /* webpackChunkName: "pagePag5" */
  '../components/report/Report.vue'
)

Vue.use(VueRouter)

const routes = [{
    path: '/login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  }, //自动重定向到'/login'
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/rights',
        component: Permissionlist
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/roles',
        component: UserRoleList
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: GoodsParams
      },
      {
        path: '/goods',
        component: GoodsLIst
      },
      {
        path: '/goods/add',
        component: GoodsAdd
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示方行
  //     next() 直接方行    next('/login') 强制跳转页面
  if (to.path === '/login') return next();
  //获取 token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
})

export default router