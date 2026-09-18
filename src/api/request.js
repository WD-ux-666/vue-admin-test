import axios from "axios";


// 创建axios实例
const server = axios.create({
    baseURL:'/api',
    timeout:5000
})
// 请求拦截器（统一加token、请求头，拓展）
server.interceptors.request.use(config =>{
    const token = localStorage.getItem('token')
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 响应拦截器（统一处理返回状态）
server.interceptors.response.use(res =>{
    return res.data
},err =>{
    if(err.response?.status === 401){
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        // 带上当前路径，登录后能跳回原页面（与路由守卫的 redirect 约定保持一致）
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?redirect=${redirect}`
    }
    if(err.response?.status === 403){
        ElMessage.error(err.response?.data?.msg || '权限不足')
    }
    console.log('请求失败',err);
    return Promise.reject(err)
})

export default server