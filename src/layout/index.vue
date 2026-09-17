<template>
   <!-- 第一层：左右分，左边侧边栏，右边内容区 -->
    <el-container class="layout-container">
         <!-- 左边：侧边栏，宽 210px，深色背景 -->
         <el-aside width="210px" class="sidebar">
            <div class="logo">
                管理系统
            </div>
            <el-menu
                :default-active = 'activeMenu'
                class="sidebar-menu"
                background-color="#304156"
                text-color="#bfcbd9"
                active-text-color="#409EFF"
                router
            >
            <el-menu-item index="/user">
                <el-icon><User /></el-icon>
                <span>用户管理</span>
            </el-menu-item>
        </el-menu>

         </el-aside>

            <!-- 右边：上下分，顶部+主内容 -->
            <el-container>
                <!-- 顶部栏，高50px，白底 -->
                 <el-header  class="header">
                    <div class="header-left">
                        {{ pageTitle }}
                    </div>
                    <div class="header-right">
                        <span>欢迎，{{ username }}</span>
                        <el-button type="danger" size="small" plain @click="handleLogout">
                            退出登录
                        </el-button>
                    </div>
                 </el-header>

                 <!-- 主内容区，灰底，放子路由页面 -->
                 <el-main class="main">
                    <!-- 子路由的页面就渲染在这里 -->
                    <router-view />
                 </el-main>
            </el-container>

    </el-container>
</template>


<script setup>
import { ref,computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { User } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const route = useRoute()
const router = useRouter()

const username = ref(localStorage.getItem('username') || 'admin')
const activeMenu = computed( () => route.path)

const pageTitle = computed(() =>{
    const map = {
        '/user':'用户管理'
    }
    return map[route.path] || '首页'
})

const handleLogout = async () =>{
    // 二次确认：ElMessageBox 点确定返回 true，取消/关闭返回 false（catch 兜住 reject）
    const confirmed = await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).catch(() => false)
    if (!confirmed) return

    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    router.push('/login')
}
</script>

<style scoped>
.layout-container{
    height: 100vh;
}
.sidebar{
    background-color: #304156;
}
.logo{
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    background-color: #2b3648;
}
.sidebar-menu{
    border-right: none;
}
.header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
}
.header-left{
    font-size: 15px;
    font-weight: 500;
}
.header-right{
    display: flex;
    align-items: center;
    gap: 12px;
}
.main{
    background-color: #f0f2f5;
    padding: 15px;
}
</style>
