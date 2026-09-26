<template>
    <div class="login-container">
        <el-card class="login-box">
            <h2>{{ isRegister?'注册账号':'用户登录' }}</h2>
         <el-form :model="form" label-position="top">
            <!-- 注册模式才显示：姓名、年龄（选填） -->
             <template v-if="isRegister">
                <el-form-item>
                    <el-input v-model="form.name" placeholder="姓名（选填，默认用用户名）" clearable/>
                </el-form-item>
                <el-form-item>
                    <el-input v-model.number="form.age" type="number" placeholder="年龄（选填）" clearable/>
                </el-form-item>
             </template>

             <el-form-item>
                <el-input v-model="form.username" placeholder="用户名" clearable/>
             </el-form-item>
             <el-form-item>
                <!-- show-password：输入框右边的眼睛图标，点一下就能看明文密码 -->
                 <el-input v-model="form.password" type="password" placeholder="密码" show-password />
             </el-form-item>
             <!-- 注册模式才显示：确认密码 -->
         <el-form-item v-if="isRegister">
            <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" show-password />
         </el-form-item>

             <el-button type="primary" style="width: 100%;" :loading="loading" @click="isRegister ? handleRegister() : handleLogin()">
                {{ loading ? '处理中...':(isRegister?'注册':'登录') }}
             </el-button>
         </el-form>
         <!-- 底部切换：登录↔注册 -->
          <p class="switch-mode" @click="switchMode">
            {{ isRegister?'已有账号？去登录':'没有账号？去注册' }}
          </p>
          <p v-if="!isRegister" class="tip">测试账号：admin/123456</p>
        </el-card>
    </div>
</template>

<script setup>
import { ref,reactive } from 'vue';
import { useRouter,useRoute} from 'vue-router';
import { login,register } from '../api/user';

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const form = reactive({
    username:'',
    password:'',
    name:'',
    age:'',
    confirmPassword:''
})
const isRegister = ref(false)

const switchMode = ()=> {
    isRegister.value = !isRegister.value
    form.username = ''
    form.password = ''
    form.name = ''
    form.age =''
    form.confirmPassword = ''
}

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
const handleRegister = async() => {
    if (!form.username || !form.password){
        ElMessage.warning('请填写用户名和密码')
        return
    }
    if (form.password !== form.confirmPassword) {
        ElMessage.warning('两次密码不一致')
        return
    }

    loading.value = true
    try{
        const res = await register({
            username:form.username,
            password:form.password,
            name:form.name,
            age:form.age
        })
        if(res.code === 200){
            ElMessageBox.alert(
                `账号：${form.username}<br>密码：${form.password}`,
                `注册成功，请妥善保存账号密码`,
                {dangerouslyUseHTMLString: true,confirmButtonText:'去登录'}
            ).then(() => {
                const savedUsername = form.username
                switchMode()
                form.username = savedUsername
            })
        }else{
            ElMessage.error(res.msg)
        }
        
    }finally{
        loading.value = false
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
.switch-mode{
    text-align: center;
    color: #409EFF;
    font-size: 13px;
    margin-top:15px;
    cursor: pointer;
}
.switch-mode:hover{
    text-decoration: underline;
}


</style>