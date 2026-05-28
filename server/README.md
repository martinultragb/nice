# 健身记录小程序后端 API

基于 Node.js + Express + MongoDB 的健身记录应用后端服务。

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- MongoDB >= 5.x

### 安装步骤

1. 进入后端目录
```bash
cd server
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，修改 MongoDB 连接字符串
```

4. 启动 MongoDB
确保本地 MongoDB 服务正在运行

5. 初始化数据库（可选）
```bash
npm run seed
```

6. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 http://localhost:3000 启动

## 📚 API 文档

### 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| GET | /api/auth/profile | 获取用户信息 | 是 |
| PUT | /api/auth/profile | 更新用户信息 | 是 |
| POST | /api/auth/logout | 退出登录 | 是 |

### 用户管理

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/users | 获取用户列表 | 管理员 |
| GET | /api/users/:id | 获取用户详情 | 管理员 |
| PUT | /api/users/:id/role | 更新用户角色 | 管理员 |
| DELETE | /api/users/:id | 删除用户 | 管理员 |

### 动作库

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/exercises | 获取动作列表 | 否 |
| GET | /api/exercises/:id | 获取动作详情 | 否 |
| POST | /api/exercises | 创建动作 | 是 |
| PUT | /api/exercises/:id | 更新动作 | 是 |
| DELETE | /api/exercises/:id | 删除动作 | 是 |

### 训练模板

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/templates | 获取模板列表 | 是 |
| GET | /api/templates/:id | 获取模板详情 | 是 |
| POST | /api/templates | 创建模板 | 是 |
| PUT | /api/templates/:id | 更新模板 | 是 |
| DELETE | /api/templates/:id | 删除模板 | 是 |

### 训练记录

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/workouts | 获取训练记录列表 | 是 |
| GET | /api/workouts/today | 获取今日训练 | 是 |
| GET | /api/workouts/date/:date | 获取指定日期训练 | 是 |
| GET | /api/workouts/:id | 获取训练详情 | 是 |
| POST | /api/workouts | 创建训练记录 | 是 |
| PUT | /api/workouts/:id | 更新训练记录 | 是 |
| DELETE | /api/workouts/:id | 删除训练记录 | 是 |

### 统计数据

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/stats/weekly | 获取周统计 | 是 |
| GET | /api/stats/monthly | 获取月统计 | 是 |
| GET | /api/stats/summary | 获取总统计 | 是 |

## 🔐 认证方式

API 使用 JWT (JSON Web Token) 进行认证。

在请求头中添加：
```
Authorization: Bearer <your_token>
```

## 📁 项目结构

```
server/
├── src/
│   ├── index.js          # 应用入口
│   ├── seed.js           # 数据库初始化
│   ├── models/           # 数据模型
│   │   ├── User.js
│   │   ├── Exercise.js
│   │   ├── Template.js
│   │   └── WorkoutRecord.js
│   ├── routes/           # 路由
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── exercises.js
│   │   ├── templates.js
│   │   ├── workouts.js
│   │   └── stats.js
│   └── middleware/       # 中间件
│       └── auth.js
├── .env                  # 环境变量
└── package.json
```

## 🛠️ 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **安全**: helmet, cors

## 📝 License

MIT
