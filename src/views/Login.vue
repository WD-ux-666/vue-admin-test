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
import { useRouter} from 'vue-router';
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const form = reactive({
    username:'',
    password:''
})

const handleLogin = async ()=>{
    if (!form.username || !form.password){
        alert('请填写用户名和密码')
        return
    }

    loading.value =true
    try{
        const res = await login(form)
        if (res.code === 200){
            localStorage.setItem('token',res.data.token)
            localStorage.setItem('username',res.data.username)

            ElMessage.success('登录成功')
            router.push('/user')
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
.form-item{
    margin-bottom: 15px;
}
.form-item input{
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}
.button:disabled{
    background: #a0cfff;
    cursor: not-allowed;
}
.tip{
    text-align: center;
    color: #999;
    font-size: 12px;
    margin-top: 15px;
}


</style>