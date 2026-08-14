<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import  User from './views/User.vue'
</script>

<template>
  <div>
    <router-link to="/user">用户管理页面</router-link>
    <!-- 路由页面渲染出口 -->
    <router-view/>
  </div>
</template>