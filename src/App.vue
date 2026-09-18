<script setup>
import { zhCn } from 'element-plus/es/locale/index.mjs';
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view/>
  </el-config-provider>
</template>