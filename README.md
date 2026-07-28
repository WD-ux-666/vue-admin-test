# Vue3 用户管理系统前端
## 项目简介
基于 Vite + Vue3 开发的简易后台管理页面，对接 Node.js + MySQL 后端接口，实现用户数据增删改查全套功能。

## 技术栈
- 构建工具：Vite
- 前端框架：Vue3
- 网络请求：Axios
- 工程配置：路径别名、本地接口代理

## 项目特性
1. 配置 `@` 路径别名，快速导入src下文件；
2. 内置开发代理，自动转发 `/api` 请求到后端3000端口，解决跨域；
3. 标准化打包、预览脚本。

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
## 配套后端接口服务
👉 \[test-api-server\](https://github.com/WD-ux-666/test-api-server)
