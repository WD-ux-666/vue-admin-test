import request from './request'



//登录接口
export function login(data){
    return request({
        url:'login',
        method:'post',
        data
    })
}

// 获取用户列表
export function getUserList(){
    return request({
        url:'/user/list',
        method:'get'
    })
}

// 新增用户
export function addUser(data){
    return request({
        url:'/user/add',
        method:'post',
        data
    })
}

// 修改用户
export function updateUser(data){
    return request({
        url:'/user/update',
        method:'put',
        data
    })
}

// 删除用户
export function delUser(id){
    return request({
        url:`/user/del/${id}`,
        method:'delete'
    })
}