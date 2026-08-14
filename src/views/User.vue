<template>
    <div>
        <!--登录退出按钮-->
        <div class="header">
            <span>欢迎，{{ username }}</span>
            <button @click="handleLogout">退出登录</button>
        </div>
        <h3>用户管理</h3>
        
        <div>
            <input v-model="form.name" placeholder="姓名">
            <input v-model.number="form.age" placeholder="年龄">

          

            <button v-if="form.id" @click="handleUpdate" :disabled="loading">
                保存修改
            </button>
            <button v-if="form.id" @click="resetForm">
                取消
            </button>
            <button v-else @click="handleAdd" :disabled="loading">

                {{ loading ? '提交中...' : '新增' }}
            </button>
        </div>

        <!-- 用户列表 -->
        <ul>
            <li v-for="item in list" :key="item.id">
                {{ item.name }} - {{ item.age }} - {{ item.id }}
                <button @click="handleEdit(item)">编辑</button>
                <button @click="handleDel(item.id)">删除</button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { addUser, updateUser, delUser, getUserList } from '../api/user'

const router = useRouter()
const username = ref(localStorage.getItem('username')||'')


//退出登录
const handleLogout = () =>{
    if (confirm('确定退出？')){
        //清除token
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        //跳回登录页
        router.push('/login')
    }
}



// 列表数据
const list = ref([])

// form 从 ref 改成 reactive
// ref 适合基本类型，reactive 适合对象类型
const form = reactive({
    name: '',
    age: '',
    id: null
})

//新增 loading 状态
// 作用：请求过程中禁用按钮，防止用户连续点击导致重复提交
const loading = ref(false)

// 加载列表
const getList = async () => {
    const res = await getUserList()
    if (res.code === 200) {
        list.value = res.data
    }
}

// 抽一个重置表单的公共方法
// 原因：新增成功和修改成功都要重置表单，抽出来避免重复代码
const resetForm = () => {
    form.name = ''
    form.age = ''
    form.id = null
}

// 新增
const handleAdd = async () => {
    // 前端先做一层校验，不合法直接拦住，不发请求
    // 原因：减轻后端压力，提升用户体验（响应更快）
    if (!form.name.trim()) {
        alert('姓名不能为空')
        return
    }

    // 防重复提交：如果正在请求中，直接 return
    if (loading.value) return

    loading.value = true
    try {
        // reactive 对象直接传，不用 .value
        const res = await addUser(form)
        alert(res.msg)
        getList()
        resetForm()
    } finally {
        // 用 finally 确保不管成功失败，loading 都会重置
        // 不用写两遍 loading.value = false
        loading.value = false
    }
}

// 编辑回填
const handleEdit = (item) => {
    // 用 Object.assign 代替展开赋值
    // 原因：reactive 对象直接重新赋值会丢失响应式，
    // Object.assign 是在原对象上修改属性，能保持响应式
    Object.assign(form, item)
}

// 保存修改
const handleUpdate = async () => {
    // 编辑前先校验 id 是否存在
    // 原因：防止用户直接点保存修改（没选编辑对象）的异常情况
    if (!form.id) {
        alert('请先选择要编辑的用户')
        return
    }
    if (!form.name.trim()) {
        alert('姓名不能为空')
        return
    }

    if (loading.value) return

    loading.value = true
    try {
        const res = await updateUser(form)
        alert(res.msg)
        getList()
        resetForm()
    } finally {
        loading.value = false
    }
}

// 删除
const handleDel = async (id) => {
    // 删除前加二次确认
    // confirm 是浏览器原生弹窗，点确定返回 true，点取消返回 false
    if (!confirm('确定要删除该用户吗？此操作不可恢复。')) {
        return
    }

    const res = await delUser(id)
    alert(res.msg)
    getList()
}

onMounted(() => {
    getList()
})
</script>

<style>

</style>
