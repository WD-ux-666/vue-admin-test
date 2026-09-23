import{createRouter,createWebHistory} from 'vue-router'

// 路由懒加载：首屏只加载当前页面需要的代码，其它页面按需请求
// Vite 会自动把每个动态 import 拆成独立 chunk
const Login = () => import('../views/Login.vue')
const Layout = () => import('../layout/index.vue')
const User = () => import('../views/User.vue')
// RBAC：新增 Role.vue 懒加载，配合下面的 /role 路由使用
const Role = () => import('../views/Role.vue')

const routes =[
    {
        path:'/login',
        name:'login',
        component:Login
    },
    {
        path:'/',
        component:Layout,
        redirect:'/user',
        children:[
            {
                path:'user',
                name:'user',
                component:User,
                // RBAC：meta.menuKey 和后端返回的 menus 数组元素对应，Layout 用它做过滤匹配
                // meta.title 给 Layout 顶栏显示当前页面标题用
                meta:{ menuKey:'user', title:'用户管理' }
            },
            {
                // RBAC：新增的角色管理路由，侧边栏会按用户 menus 动态显示
                path:'role',
                name:'role',
                component:Role,
                meta:{ menuKey:'role', title:'角色管理' }
            }
        ]
    }
]

const router = createRouter({
    history:createWebHistory(),
    routes
})

//路由守卫
router.beforeEach((to,from,next)=>{
    const token = localStorage.getItem('token')
    if(to.path === '/login'){
        if(token){
            next('/user')
        }else{
            next()
        }
        return
    }

    if(token){
        next()
    }else{
        next(`/login?redirect=${to.path}`)
    }
})

export default router
