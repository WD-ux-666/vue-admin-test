import request from './request'

// ============ RBAC：角色管理 API（对应后端 /api/role/* 四个接口）============

// 角色列表（登录后用于侧边栏渲染 + Role.vue 列表）
// 注：list 接口没挂 requirePerm，登录用户都能查——因为侧边栏渲染依赖它
export function getRoleList(){
    return request({
        url:'/role/list',
        method:'get'
    })
}

// 新增角色（后端挂了 requirePerm('role')，无 role 菜单权限的会 403）
export function addRole(data){
    return request({
        url:'/role/add',
        method:'post',
        data
    })
}

// 修改角色（role_key 不允许改，只传 id/roleName/menus）
export function updateRole(data){
    return request({
        url:'/role/update',
        method:'put',
        data
    })
}

// 删除角色（后端会先查 user 表有无占用，有占用会拒绝，引用完整性保护）
export function delRole(id){
    return request({
        url:`/role/del/${id}`,
        method:'delete'
    })
}
