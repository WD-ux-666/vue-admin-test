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

        window.location.href ='/login'
    }
    console.log('请求失败',err);
    return Promise.reject(err)
})

export default server