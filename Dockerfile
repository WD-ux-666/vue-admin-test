# ===== 阶段1：构建阶段，用 node 镜像跑 npm run build =====
FROM node:18-slim AS builder

WORKDIR /app

# 拷 package*.json 先装依赖（利用 Docker 缓存层）
COPY package*.json ./
RUN npm install

# 拷全部源码
COPY . .

# 构建产物到 dist/
RUN npm run build


# ===== 阶段2：部署阶段，用 nginx 托管静态文件 =====
FROM nginx:alpine

# 把阶段1的 dist 拷到 nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 自定义 nginx 配置：SPA 路由 + /api 反代到后端容器
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
