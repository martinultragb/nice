# 健身记录小程序

基于 Taro 框架开发的微信小程序健身记录应用。

## 功能特性

- 🏋️ 力量训练记录
- 📋 训练模板管理
- 📊 数据统计分析
- ⚙️ 动作库管理

## 开发说明

### 1. 安装依赖

```bash
npm install
```

### 2. 添加 TabBar 图标

在 `src/assets/` 目录下添加以下图标文件（需要 81x81 像素的 PNG 图片）：

- `dumbbell.png` - 训练页面图标
- `dumbbell-active.png` - 训练页面选中图标
- `clipboard.png` - 模板页面图标
- `clipboard-active.png` - 模板页面选中图标
- `chart.png` - 记录页面图标
- `chart-active.png` - 记录页面选中图标
- `settings.png` - 管理页面图标
- `settings-active.png` - 管理页面选中图标

### 3. 开发调试

```bash
# 启动微信小程序开发
npm run dev:weapp

# 启动 H5 开发
npm run dev:h5
```

### 4. 构建发布

```bash
# 构建微信小程序
npm run build:weapp

# 构建 H5
npm run build:h5
```

## 使用微信开发者工具

1. 克隆项目后，进入 `weapp` 目录
2. 运行 `npm install` 安装依赖
3. 运行 `npm run dev:weapp` 启动开发
4. 打开微信开发者工具，导入 `weapp/dist` 目录
5. 使用你的 AppID 或测试号即可预览

## 技术栈

- Taro 4.x
- React 18
- TypeScript
- Tailwind CSS
- @tarojs/store

## 项目结构

```
weapp/
├── src/
│   ├── pages/          # 页面组件
│   │   ├── home/       # 训练页面
│   │   ├── templates/  # 模板页面
│   │   ├── records/    # 记录页面
│   │   ├── stats/      # 统计页面
│   │   └── admin/      # 管理页面
│   ├── store/          # 状态管理
│   ├── types/          # 类型定义
│   └── app.tsx         # 应用入口
├── taro.config.ts     # Taro 配置
├── package.json
└── README.md
```

## License

MIT
