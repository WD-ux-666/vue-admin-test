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
                <!-- RBAC：动态渲染侧边栏，根据登录返回的 menus 数组过滤可见菜单项 -->
                <!-- 用 v-for 而非写死 el-menu-item，新增菜单只需在 allMenus 加一项 + 后端 menus 加 key -->
                <template v-for="item in visibleMenus" :key="item.key">
                    <el-menu-item :index="item.path">
                        <el-icon><component :is="item.icon" /></el-icon>
                        <span>{{ item.title }}</span>
                    </el-menu-item>
                </template>
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
                        <!-- RBAC：顶栏显示用户名 + 角色名，roleName 在登录时存入 localStorage -->
                        <span>欢迎，{{ username }}（{{ roleName }}）</span>
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
import { User, Setting } from '@element-plus/icons-vue';

const route = useRoute()
const router = useRouter()

const username = ref(localStorage.getItem('username') || 'admin')
// RBAC：读顶栏显示用的角色名
const roleName = ref(localStorage.getItem('roleName') || '')
const activeMenu = computed(() => route.path)

// RBAC：全量菜单配置（前台写死所有可能的菜单项）
// key：和后端返回的 menus 数组元素 + 路由 meta.menuKey 一一对应
// path：跳转路径，对应路由 children 里的 path
// icon：从 @element-plus/icons-vue 引入的组件
// 新增菜单只需在这里加一项 + 后端给对应角色 menus 数组里加这个 key
const allMenus = [
    { key:'user', path:'/user', title:'用户管理', icon: User },
    { key:'role', path:'/role', title:'角色管理', icon: Setting }
]

// RBAC：可见菜单 = 全量菜单 ∩ 当前用户角色拥有的 menus
// 这里读 localStorage 是为了在刷新页面后仍能保留菜单状态（localStorage 不会随刷新丢失）
const visibleMenus = computed(() => {
    const menus = JSON.parse(localStorage.getItem('menus') || '[]')
    return allMenus.filter(m => menus.includes(m.key))
})

// 顶部标题：优先读路由 meta.title，没有就 fallback '首页'
const pageTitle = computed(() => route.meta.title || '首页')

const handleLogout = async () =>{
    // 二次确认：ElMessageBox 点确定返回 true，取消/关闭返回 false（catch 兜住 reject）
    const confirmed = await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).catch(() => false)
    if (!confirmed) return

    // RBAC：退出时连 5 个 key 一起清，防止残留导致下次登录前页面状态错乱
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('roleKey')
    localStorage.removeItem('roleName')
    localStorage.removeItem('menus')
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
