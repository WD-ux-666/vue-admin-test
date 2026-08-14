<template>
    <div class="login-container">
        <div class="login-box">
            <h2>用户登录</h2>
            <div class="form-item">
                <input v-model="form.username" placeholder="用户名">
            </div>
            <div class="form-item">
                <input v-model="form.password" type="password" placeholder="密码">
            </div>
            <button @click="handleLogin" :disabled="loading">
                {{ loading ?'登录中...':'登录' }}
            </button> 
            <p class="tip">测试账号：admin/123456</p>
        </div>
    </div>
</template>

<script setup>
import { login } from '../api/user';
import { ref,reactive } from 'vue';
import { useReducer } from 'react';

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

            alert('登录成功')
            router.push('/user')
        }else{
            alert(res.msg)

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


</style>