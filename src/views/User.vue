<template>
    <div class="page">
        <!-- 用户列表 -->
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>用户管理</span>
                    <!-- 按ID查询单个用户 + 新增入口 -->
                    <div>
                        <el-input v-model="searchId" placeholder="输入ID查询" style="width: 160px; margin-right: 8px" clearable />
                        <el-button type="primary" @click="handleSearchById">查询</el-button>
                        <el-button @click="resetSearch">重置</el-button>
                        <el-button v-if="roleKey==='admin'" type="primary" @click="handleAdd">新增用户</el-button>
                    </div>
                </div>
            </template>

            <!-- 表格：v-loading 请求中显示加载遮罩 -->
            <el-table :data="list" border stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="age" label="年龄" width="100" />
                <!-- RBAC：新增的角色列，role_name 来自后端 list 接口 JOIN role 表带出 -->
                <el-table-column prop="role_name" label="角色" width="120" />
                <el-table-column prop="create_time" label="创建时间" />
                <!-- 非管理员直接不渲染整列，避免留一个 160px 的空列 -->
                <!-- RBAC：判断从 role 改成 roleKey，对应后端登录响应字段 -->
                <el-table-column v-if="roleKey === 'admin'" label="操作" width="160">
                    <template #default="{ row }">
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDel(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页器：total 总数，current-page 当前页，page-size 每页条数，翻页/改条数都重新加载 -->
             <el-pagination
                background
                layout="total,prev,pager,next,sizes,jumper"
                :total="total"
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :page-sizes="[5,10,20,50]"
                @current-change="getList"
                @size-change ="handleSizeChange"
                style="margin-top: 16px; justify-content: flex-end;"
            />
        </el-card>

        <!-- 新增/编辑弹窗：form.id 有值=编辑模式，无值=新增模式（原注释：状态分离，有id显示保存+取消，无id显示新增） -->
        <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" width="400px">
            <el-form :model="form" label-width="60px">
                <el-form-item label="姓名">
                    <el-input v-model="form.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input v-model="form.age" placeholder="请输入年龄" />
                </el-form-item>
                <!-- RBAC：新增/编辑时选角色，下拉选项来自 onMounted 里拉的 roleList -->
                <!-- 用 r.id 作为 value，r.role_name 作为 label，提交时把 roleId 发给后端 -->
                <el-form-item label="角色">
                    <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
                        <el-option
                            v-for="r in roleList"
                            :key="r.id"
                            :label="r.role_name"
                            :value="r.id"
                        />
                    </el-select>
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
import { addUser, updateUser, delUser, getUserList, getUserById } from '../api/user'
// RBAC：引入角色列表接口，供弹窗下拉用
import { getRoleList } from '../api/role'

// RBAC：权限判断从原来的 role 改成 roleKey
// 旧的 localStorage 'role' 已废弃，新登录会存 'roleKey'，对应后端 role_key 字段
const roleKey = ref(localStorage.getItem('roleKey') || '')

// 列表数据
const list = ref([])

// RBAC：角色下拉选项，onMounted 时从后端拉取
const roleList = ref([])

// form 用 reactive：ref 适合基本类型，reactive 适合对象类型
// RBAC：form 增加 roleId 字段，新增/编辑时一并提交给后端
const form = reactive({
    name: '',
    age: '',
    roleId: null,
    id: null
})

// loading 状态：请求中禁用按钮/表格遮罩，防止用户连续点击导致重复提交
const loading = ref(false)

// dialogVisible：控制新增/编辑弹窗的显示与隐藏
const dialogVisible = ref(false)

// 分页状态：page 当前页码，pageSize 每页条数，total 总条数
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索状态：按ID查询单个用户
const searchId = ref('')

// 按ID查询：查到就显示在表格里（单条），查不到提示
const handleSearchById = async () => {
    if (!searchId.value.trim()) {
        ElMessage.warning('请输入要查询的ID')
        return
    }
    const res = await getUserById(searchId.value)
    if (res.code === 200) {
        list.value = [res.data]   // 单对象包成数组喂给表格
        total.value = 1
    } else if (res.code === 404) {
        ElMessage.warning(res.msg)  // '用户不存在'
    }
}

// 重置：回到分页列表
const resetSearch = () => {
    searchId.value = ''
    page.value = 1
    getList()
}

// 加载列表
const getList = async () => {
    try {
        const res = await getUserList(page.value, pageSize.value)
        if (res.code === 200) {
            list.value = res.data.list
            total.value = res.data.total
        }
    } catch (err) {
        // 401 已由响应拦截器统一跳转登录页，这里只兜底其它错误，避免未处理的 Promise 异常
        if (err.response?.status !== 401) {
            ElMessage.error(err.response?.data?.msg || '列表加载失败')
        }
    }
}

//每页条数变化：重置回第1页再刷新
const handleSizeChange = ()=>{
    page.value = 1
    getList()
}

// 公共重置表单方法：新增成功和修改成功都要重置表单，抽出来避免重复代码
// RBAC：重置时连 roleId 一起清空，避免上次编辑的角色残留到下次新增
const resetForm = () => {
    form.name = ''
    form.age = ''
    form.roleId = null
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
    } catch (err) {
        // 401/403 已由响应拦截器统一提示，这里只兜底，避免未捕获的 Promise 异常
        // 弹窗保持打开，用户可修正后重试
        console.error(err)
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

    try {
        const res = await delUser(id)
        ElMessage.success(res.msg)
        if (list.value.length === 1 && page.value > 1) {
            page.value--
        }
        getList()
    } catch (err) {
        // 401/403 已由响应拦截器统一提示，这里只兜底，避免未捕获的 Promise 异常
        console.error(err)
    }
}

onMounted(() => {
    getList()
    // RBAC：进页面时拉一次角色列表，供新增/编辑弹窗的角色下拉用
    // 这里没用 await 而用 then，是为了让它和 getList 并行，不阻塞列表加载
    getRoleList().then(res => {
        if (res.code === 200) roleList.value = res.data
    })
})
</script>

<style>
/* 页面整体布局 */
.page {
    padding: 20px;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
