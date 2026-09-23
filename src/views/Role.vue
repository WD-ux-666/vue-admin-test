<template>
    <div class="page">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>角色管理</span>
                    <el-button type="primary" @click="handleAdd">新增角色</el-button>
                </div>
            </template>

            <el-table :data="list" border stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="role_key" label="角色标识" width="150" />
                <el-table-column prop="role_name" label="角色名称" width="150" />
                <!-- RBAC：可见菜单列，用 tag 展示 menus 数组里的每个菜单 key -->
                <!-- menuLabel 把 key 翻译成中文名，避免表格里显示 'user' 这种英文 -->
                <el-table-column label="可见菜单" min-width="200">
                    <template #default="{ row }">
                        <el-tag
                            v-for="m in (row.menus || [])"
                            :key="m"
                            style="margin-right: 6px"
                        >
                            {{ menuLabel(m) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160">
                    <template #default="{ row }">
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDel(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- RBAC：新增/编辑弹窗，role_key 仅新增时可编辑，编辑时禁用（标识不可改） -->
        <!-- 理由：role_key 在后端代码里被 requirePerm('role') 这种逻辑硬编码引用，改了会断权限链 -->
        <el-dialog v-model="dialogVisible" :title="form.id ? '编辑角色' : '新增角色'" width="450px">
            <el-form :model="form" label-width="80px">
                <el-form-item label="角色标识">
                    <el-input
                        v-model="form.roleKey"
                        placeholder="如 editor，新增后不可改"
                        :disabled="!!form.id"
                    />
                </el-form-item>
                <el-form-item label="角色名称">
                    <el-input v-model="form.roleName" placeholder="如 编辑" />
                </el-form-item>
                <!-- RBAC：菜单权限用 checkbox-group 多选 -->
                <!-- checkbox 的 label 就是菜单 key，勾选后自动 push 到 form.menus 数组 -->
                <!-- 新增菜单只需在这里加一个 el-checkbox + 全局 allMenus 加一项 + 路由加一项 -->
                <el-form-item label="可见菜单">
                    <el-checkbox-group v-model="form.menus">
                        <el-checkbox label="user">用户管理</el-checkbox>
                        <el-checkbox label="role">角色管理</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
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
import { getRoleList, addRole, updateRole, delRole } from '../api/role'

// RBAC：菜单 key -> 中文名映射，给表格里的 tag 用
// 这里写死是因为菜单是有限的几个，不需要专门做一张菜单表
const menuLabel = (key) => {
    const map = { user:'用户管理', role:'角色管理' }
    return map[key] || key
}

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)

// RBAC：角色表单，menus 是数组，如 ['user','role']
const form = reactive({
    id: null,
    roleKey: '',
    roleName: '',
    menus: []
})

const getList = async () => {
    loading.value = true
    try {
        const res = await getRoleList()
        if (res.code === 200) list.value = res.data
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    form.id = null
    form.roleKey = ''
    form.roleName = ''
    form.menus = []
}

const handleAdd = () => {
    resetForm()
    dialogVisible.value = true
}

// RBAC：编辑回填
// 注意 menus 要用展开运算符拷贝一份（[...row.menus]），不能直接 form.menus = row.menus
// 否则 form 和 list 共享同一个数组引用，编辑中途表格里的 tag 也会跟着变
const handleEdit = (row) => {
    form.id = row.id
    form.roleKey = row.role_key
    form.roleName = row.role_name
    form.menus = [...(row.menus || [])]
    dialogVisible.value = true
}

const handleSubmit = async () => {
    if (!form.roleKey.trim() || !form.roleName.trim()) {
        ElMessage.warning('角色标识和名称不能为空')
        return
    }
    if (loading.value) return
    loading.value = true
    try {
        // RBAC：payload 显式挑字段，避免把 form 里的额外属性（如编辑时 row 里的 create_time）带进去
        const payload = {
            id: form.id,
            roleKey: form.roleKey,
            roleName: form.roleName,
            menus: form.menus
        }
        const res = form.id ? await updateRole(payload) : await addRole(payload)
        ElMessage.success(res.msg)
        dialogVisible.value = false
        getList()
        resetForm()
    } catch (err) {
        // 401/403 已由响应拦截器统一提示
        console.error(err)
    } finally {
        loading.value = false
    }
}

const handleDel = async (id) => {
    const confirmed = await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).catch(() => false)
    if (!confirmed) return

    try {
        // RBAC：后端会先查 user 表有无占用此角色，有占用会返回 400 + 错误信息
        const res = await delRole(id)
        ElMessage.success(res.msg)
        getList()
    } catch (err) {
        // 401/403 已由响应拦截器统一提示；400（有用户占用）会被拦截器当作错误，但 ElMessage 已提示
        console.error(err)
    }
}

onMounted(() => {
    getList()
})
</script>

<style>
.page {
    padding: 20px;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
