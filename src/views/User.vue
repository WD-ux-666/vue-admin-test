<template>
    <div>
        <h3>用户管理</h3>
        <!-- 新增/编辑表单 -->
        <div>
            <input v-model="form.name" placeholder="姓名">
            <input v-model.number = "form.age" placeholder="年龄">
            <button @click="handleAdd">新增</button>
            <button @click="handleUpdate">保存修改</button>
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
import { addUser, updateUser, delUser, getUserList } from '../api/user'

// 列表数据
const list = ref([])

//表单
const form = ref({
    name:'',
    age:'',
    id:null
})

//加载列表
const getList = async()=>{
    const res = await getUserList()
    if(res.code===200){
        list.value = res.data
    }
}

//新增
const handleAdd = async()=>{
    const res = await addUser(form.value)
    alert(res.msg)
    getList()
    form.value = {name:'',age:'',id:null}
}

//编辑回填
const handleEdit = (item)=>{
    form.value = {...item}
}

//保存修改
const handleUpdate = async()=>{
    const res = await updateUser(form.value)
    alert(res.msg)
    getList()
    form.value = {name:'',age:'',id:null}
}

//删除
const handleDel = async(id)=>{
    const res = await delUser(id)
    alert(res.msg)
    getList()
}

onMounted(()=>{
    getList()
})
</script>

<style>

</style>
