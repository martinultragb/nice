# 健身记录小程序部署指南

## 项目结构

```
fitness-app/
├── src/                    # React Web 应用
├── weapp/                 # 微信小程序 (Taro)
└── server/                # 后端服务
```

## 一、部署后端服务

### 1. 环境要求

- Node.js >= 16.x
- MongoDB >= 5.x

### 2. 安装步骤

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改 MONGODB_URI

# 启动 MongoDB
mongod

# 初始化默认动作库（可选）
npm run seed

# 启动服务
npm start
```

### 3. 环境变量配置

创建 `.env` 文件：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitness-app
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. 生产环境部署

#### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start src/index.js --name fitness-api

# 查看状态
pm2 status

# 查看日志
pm2 logs fitness-api

# 设置开机自启
pm2 save
pm2 startup
```

#### 使用 Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/fitness-app
    depends_on:
      - mongo

  mongo:
    image: mongo:5
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 5. Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name api.fitness-app.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 二、部署前端应用

### React Web 应用

```bash
cd src

# 安装依赖
npm install

# 构建生产版本
npm run build

# 使用 Nginx 部署
```

### 微信小程序

```bash
cd weapp

# 安装依赖
npm install

# 构建微信小程序
npm run build:weapp

# 使用微信开发者工具导入 dist 目录
```

## 三、修改前端 API 地址

### Web 应用

创建 `.env.production` 文件：

```env
REACT_APP_API_URL=https://api.fitness-app.com/api
```

### 微信小程序

修改 `weapp/src/utils/api.js`：

```javascript
const API_BASE_URL = 'https://api.fitness-app.com/api';
```

## 四、生产环境检查清单

- [ ] MongoDB 数据库已配置
- [ ] JWT Secret 已修改为强密码
- [ ] HTTPS 证书已配置
- [ ] CORS 已正确配置
- [ ] 环境变量已设置
- [ ] 数据库已初始化默认动作库
- [ ] 防火墙已开放必要端口
- [ ] 域名已解析
- [ ] SSL 证书已配置

## 五、监控和维护

### 日志管理

```bash
# 使用 PM2 日志
pm2 logs fitness-api --lines 100

# 使用系统日志
journalctl -u fitness-api -f
```

### 数据库备份

```bash
# MongoDB 备份
mongodump --db fitness-app --out /backup/path

# MongoDB 恢复
mongorestore --db fitness-app /backup/path/fitness-app
```

### 性能优化

- 开启 MongoDB 索引
- 使用 Redis 缓存（可选）
- 配置 CDN 加速静态资源
- 启用 Gzip 压缩

## 六、常见问题

### 1. MongoDB 连接失败

检查：
- MongoDB 服务是否启动
- 连接字符串是否正确
- 防火墙是否开放 27017 端口

### 2. JWT Token 过期

解决方案：
- 刷新页面重新登录
- 实现 Token 刷新机制

### 3. CORS 跨域错误

检查：
- 后端 CORS 配置是否正确
- 前端请求地址是否正确
- 浏览器控制台具体错误信息
