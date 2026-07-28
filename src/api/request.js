import axios from "axios";


// 创建axios实例
const server = axios.create({
    baseURL:'/api',
    timeout:5000
})
// 请求拦截器（统一加token、请求头，拓展）
server.interceptors.request.use(config =>{
    return config
})

// 响应拦截器（统一处理返回状态）
server.interceptors.response.use(res =>{
    return res.data
},err =>{
    console.log('请求失败',err);
    return Promise.reject(err)
})

export default server