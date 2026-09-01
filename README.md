# Vue3 用户管理系统前端

## 项目简介
基于 Vite + Vue3 开发的简易后台管理页面，对接 Node.js + MySQL 后端接口，实现用户登录鉴权与数据增删改查全套功能。

## 技术栈
- 前端框架：Vue3（组合式 API + `<script setup>`）
- UI 组件库：Element Plus
- 路由管理：Vue Router
- 网络请求：Axios
- 构建工具：Vite
- 工程配置：路径别名、本地接口代理

## 项目特性
1. 配置 `@` 路径别名，快速导入src下文件；
2. 内置开发代理，自动转发 `/api` 请求到后端3000端口，解决跨域；
3. 集成 Element Plus 组件库，提供表单、表格、弹窗、消息提示等交互；
4. 登录后自动携带 JWT Token，接口 401 自动跳转登录页；
5. 路由守卫拦截未登录访问，支持退出登录；
6. 用户列表支持分页（el-pagination），可按 ID 查询单个用户；
7. 标准化打包、预览脚本。

## 项目截图
<img width="2559" height="1527" alt="主页面效果图" src="https://github.com/user-attachments/assets/e0178779-850a-4e4d-8748-2816a5a3912f" />

<img width="2559" height="1527" alt="登录效果图" src="https://github.com/user-attachments/assets/5615a0d4-cd2a-4686-85cb-d3ad118b2684" />

## 快速启动
```bash
# 拉取项目
git clone https://github.com/WD-ux-666/vue-admin-test.git
cd vue-admin-test

# 安装依赖
npm install

# 本地开发运行
npm run dev

# 打包
npm run build
# 本地预览打包文件
npm run preview
```

> 测试账号：admin / 123456

## 配套后端接口服务
👉 [test-api-server](https://github.com/WD-ux-666/test-api-server)
