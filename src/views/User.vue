<template>
    <div class="page">
        <!--登录退出按钮-->
        <div class="header">
            <span>欢迎，{{ username }}</span>
            <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
        </div>

        <!-- 用户列表 -->
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>用户管理</span>
                    <!-- 新增入口：重置表单并打开弹窗 -->
                    <el-button type="primary" @click="handleAdd">新增用户</el-button>
                </div>
            </template>

            <!-- 表格：v-loading 请求中显示加载遮罩 -->
            <el-table :data="list" border stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="age" label="年龄" width="100" />
                <el-table-column prop="create_time" label="创建时间" />
                <el-table-column label="操作" width="160">
                    <template #default="{ row }">
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDel(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 新增/编辑弹窗：form.id 有值=编辑模式，无值=新增模式（原注释：状态分离，有id显示保存+取消，无id显示新增） -->
        <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" width="400px">
            <el-form :model="form" label-width="60px">
                <el-form-item label="姓名">
                    <el-input v-model="form.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input v-model.number="form.age" placeholder="请输入年龄" />
                </el-form-item>
            </el-form>
            <!-- 取消关闭弹窗；确定按钮 :loading 绑定 loading，请求中不可点，防止重复提交 -->
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="loading" @click="handleSubmit">
                    {{ loading ? '提交中...' : '确定' }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addUser, updateUser, delUser, getUserList } from '../api/user'

const router = useRouter()
const username = ref(localStorage.getItem('username') || '')

// 退出登录：二次确认后清除token并跳回登录页
const handleLogout = async () => {
    // 二次确认：ElMessageBox 点确定返回 true，取消/关闭返回 false（catch 兜住 reject）
    const confirmed = await ElMessageBox.confirm('确定退出登录吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).catch(() => false)
    if (!confirmed) return

    //清除token和用户名
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    //跳回登录页
    router.push('/login')
}

// 列表数据
const list = ref([])

// form 用 reactive：ref 适合基本类型，reactive 适合对象类型
const form = reactive({
    name: '',
    age: '',
    id: null
})

// loading 状态：请求中禁用按钮/表格遮罩，防止用户连续点击导致重复提交
const loading = ref(false)

// dialogVisible：控制新增/编辑弹窗的显示与隐藏
const dialogVisible = ref(false)

// 加载列表
const getList = async () => {
    try {
        const res = await getUserList()
        if (res.code === 200) {
            list.value = res.data
        }
    } catch (err) {
        // 401 已由响应拦截器统一跳转登录页，这里只兜底其它错误，避免未处理的 Promise 异常
        if (err.response?.status !== 401) {
            ElMessage.error(err.response?.data?.msg || '列表加载失败')
        }
    }
}

// 公共重置表单方法：新增成功和修改成功都要重置表单，抽出来避免重复代码
const resetForm = () => {
    form.name = ''
    form.age = ''
    form.id = null
}

// 新增：先重置表单（清掉可能残留的编辑 id），再打开弹窗
const handleAdd = () => {
    resetForm()
    dialogVisible.value = true
}

// 编辑回填：用 Object.assign 代替直接赋值（reactive 直接重新赋值会丢失响应式，assign 在原对象上改属性），再打开弹窗
const handleEdit = (item) => {
    Object.assign(form, item)
    dialogVisible.value = true
}

// 新增/编辑统一提交：form.id 有值走 update（编辑），无值走 add（新增）
// 编辑入口只有表格行的"编辑"按钮、必带 id，因此无需再单独校验 id
const handleSubmit = async () => {
    // 前端先做一层校验，不合法直接拦住不发请求：减轻后端压力，提升用户体验（响应更快）
    if (!form.name.trim()) {
        ElMessage.warning('姓名不能为空')
        return
    }

    // 防重复提交：如果正在请求中，直接 return
    if (loading.value) return

    loading.value = true
    try {
        // reactive 对象直接传，不用 .value
        const res = form.id ? await updateUser(form) : await addUser(form)
        ElMessage.success(res.msg)
        dialogVisible.value = false
        getList()
        resetForm()
    } finally {
        // finally 确保不管成功失败 loading 都会重置，不用写两遍 loading.value = false
        loading.value = false
    }
}

// 删除
const handleDel = async (id) => {
    // 删除前加二次确认：点确定返回 true，取消返回 false
    const confirmed = await ElMessageBox.confirm('确定要删除该用户吗？此操作不可恢复。', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).catch(() => false)
    if (!confirmed) return

    const res = await delUser(id)
    ElMessage.success(res.msg)
    getList()
}

onMounted(() => {
    getList()
})
</script>

<style>
/* 页面整体布局 */
.page {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
