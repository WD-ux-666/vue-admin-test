import{createRouter,createWebHistory} from 'vue-router'
import User from '../views/User.vue'
import Login from '../views/Login.vue'

const routes =[
    {
        path:'/',
        redirect:'/user'
    },
    {
        path:'/login',
        name:'login',
        component:Login
    },
    {
        path:'/user',
        name:'user',
        component:User
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