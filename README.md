# ClawHelper

OpenClaw 桌面管理工具，基于 Electron + Vue 3 + TypeScript 构建的跨平台桌面应用。

## 功能特性

- **网关管理** - 启动/重启/停止 OpenClaw 网关服务
- **控制台集成** - 内嵌 OpenClaw Web 控制台，支持 Tab 页签管理
- **微信绑定** - 支持微信账号绑定功能
- **多平台支持** - 支持 Windows、macOS、Linux 系统

## 技术栈

- **框架**: Electron 42
- **前端**: Vue 3 + TypeScript
- **构建工具**: Vite 7
- **打包工具**: electron-builder

## 项目结构

```
claw-helper/
├── src/
│   ├── main/              # 主进程代码
│   │   └── index.ts       # 应用入口、IPC 通信、网关管理
│   ├── preload/           # 预加载脚本
│   │   ├── index.ts       # API 暴露给渲染进程
│   │   └── index.d.ts     # TypeScript 类型定义
│   └── renderer/          # 渲染进程代码
│       ├── src/
│       │   ├── components/
│       │   │   ├── Home.vue       # 首页组件
│       │   │   ├── AboutDialog.vue # 关于对话框
│       │   │   └── Versions.vue   # 版本信息组件
│       │   ├── App.vue            # 主应用组件
│       │   ├── main.ts            # 渲染进程入口
│       │   └── assets/            # 静态资源
│       └── index.html             # HTML 入口
├── resources/             # 应用资源
│   └── icon.png           # 应用图标
├── electron.vite.config.ts # Vite 配置
├── electron-builder.yml   # 打包配置
└── package.json           # 项目依赖与脚本
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
# 通用构建
npm run build

# Windows 构建
npm run build:win

# macOS 构建
npm run build:mac

# Linux 构建
npm run build:linux
```

### 其他命令

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

## IPC 通信

应用通过 IPC 机制实现主进程与渲染进程的通信：

| 方法 | 描述 |
|------|------|
| `start-gateway` | 启动 OpenClaw 网关服务 |
| `open-external` | 打开外部链接 |
| `get-versions` | 获取应用版本信息 |
| `new-window-request` | 监听新窗口请求 |

## 许可证

MIT License