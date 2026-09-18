import{createRouter,createWebHistory} from 'vue-router'

// 路由懒加载：首屏只加载当前页面需要的代码，其它页面按需请求
// Vite 会自动把每个动态 import 拆成独立 chunk
const Login = () => import('../views/Login.vue')
const Layout = () => import('../layout/index.vue')
const User = () => import('../views/User.vue')

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
                component:User
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
