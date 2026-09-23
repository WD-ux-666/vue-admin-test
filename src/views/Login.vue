<template>
    <div class="login-container">
        <el-card class="login-box">
            <h2>用户登录</h2>
            <el-form :model="form" label-position="top">
                <el-form-item>
                    <el-input v-model="form.username" placeholder="用户名" clearable />
                </el-form-item>
                <el-form-item>
                    <el-input v-model="form.password" type="password" placeholder="密码" show-password />
                </el-form-item>
                <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin">
                    {{ loading ? '登录中...' : '登录' }}
                </el-button>
            </el-form>
            <p class="tip">测试账号：admin/123456</p>
        </el-card>
    </div>
</template>

<script setup>
import { login } from '../api/user';
import { ref,reactive } from 'vue';
import { useRouter,useRoute} from 'vue-router';

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const form = reactive({
    username:'',
    password:''
})

const handleLogin = async ()=>{
    if (!form.username || !form.password){
        ElMessage.warning('请填写用户名和密码')
        return
    }

    loading.value =true
    try{
        const res = await login(form)
        if (res.code === 200){
            localStorage.setItem('token',res.data.token)
            localStorage.setItem('username',res.data.username)
            // RBAC：把后端登录响应里的角色信息全部存本地，供 Layout 动态渲染侧边栏 + 前端按钮级权限判断
            // roleKey：代码里做权限判断用（如 roleKey==='admin'）
            // roleName：顶栏显示"欢迎，admin（管理员）"用
            // menus：JSON 数组，如 ['user','role']，Layout 用它过滤侧边栏可见项
            localStorage.setItem('roleKey',res.data.roleKey)
            localStorage.setItem('roleName',res.data.roleName)
            localStorage.setItem('menus',JSON.stringify(res.data.menus || []))

            ElMessage.success('登录成功')
            router.push(route.query.redirect || '/user')
        }else{
            ElMessage.error(res.msg)

        }
    }finally{
        loading.value =false
    }
}


</script>

<style scoped>
.login-container{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f5f5f5;
}
.login-box{
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    width: 380px;
}
.login-box h2{
    text-align: center;
    margin-bottom: 20px;
}
.tip{
    text-align: center;
    color: #999;
    font-size: 12px;
    margin-top: 15px;
}


</style>