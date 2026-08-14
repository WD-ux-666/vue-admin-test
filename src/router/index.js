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

export default router