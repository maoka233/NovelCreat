# Contributing to NovelCreat

首先，感谢您考虑为 NovelCreat 做出贡献！我们欢迎各种形式的贡献，包括但不限于代码、文档、测试、设计和想法。

## 行为准则

请参与者遵守我们的行为准则，保持友好、尊重和包容的态度。

## 如何贡献

### 报告 Bug

如果您发现 bug，请通过 GitHub Issues 报告，并包含以下信息：

1. 使用 [Bug Report 模板](.github/ISSUE_TEMPLATE/bug_report.md)
2. 详细描述问题和复现步骤
3. 您的操作系统和 Node.js 版本
4. 相关的错误信息或截图

### 提出新功能

如果您有新功能的想法：

1. 使用 [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.md)
2. 描述功能的目的和价值
3. 提供可能的实现方案（如果有）

### 提交代码

#### 开发流程

1. **Fork 仓库**
   ```bash
   # 在 GitHub 上 fork 仓库，然后 clone 到本地
   git clone https://github.com/YOUR_USERNAME/NovelCreat.git
   cd NovelCreat
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **开发和测试**
   ```bash
   npm run dev          # 启动开发服务器
   npm run lint         # 代码检查
   npm run typecheck    # 类型检查
   npm run format       # 格式化代码
   ```

5. **提交更改**
   
   我们使用 Conventional Commits 规范：
   
   ```bash
   git commit -m "feat: 添加新功能描述"
   git commit -m "fix: 修复某个bug"
   git commit -m "docs: 更新文档"
   git commit -m "style: 代码格式调整"
   git commit -m "refactor: 重构某部分代码"
   git commit -m "test: 添加测试"
   git commit -m "chore: 构建过程或辅助工具的变动"
   ```

6. **推送和创建 PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   然后在 GitHub 上创建 Pull Request。

#### 代码规范

- **TypeScript**: 使用严格模式，确保类型安全
- **ESLint**: 遵循项目的 ESLint 配置
- **Prettier**: 使用 Prettier 格式化代码
- **命名规范**:
  - 组件: PascalCase (例如: `ChapterEditor.tsx`)
  - 文件: camelCase (例如: `deepSeekService.ts`)
  - 变量/函数: camelCase
  - 常量: UPPER_SNAKE_CASE
  - 接口/类型: PascalCase

#### 提交信息格式

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修复bug）
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动

**范围 (scope):** (可选)
- `ui`: 用户界面
- `api`: API 相关
- `editor`: 编辑器
- `storage`: 存储
- 等等

**示例:**
```
feat(editor): 添加自动保存功能

实现编辑器的自动保存功能，每5秒自动保存一次内容。

Closes #123
```

#### Pull Request 指南

1. 使用 [PR 模板](.github/PULL_REQUEST_TEMPLATE.md)
2. 确保代码通过所有检查（lint、typecheck、build）
3. 更新相关文档
4. 添加或更新测试（如果适用）
5. 保持 PR 专注于单一目的
6. 响应评审意见

## 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 8+
- Git

### 推荐工具

- VS Code + 以下插件:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

### 项目结构

```
NovelCreat/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 主进程入口
│   │   └── preload.ts     # Preload 脚本
│   └── renderer/          # React 渲染进程
│       ├── components/    # React 组件
│       ├── services/      # 业务逻辑服务
│       ├── stores/        # Zustand 状态管理
│       ├── types/         # TypeScript 类型定义
│       ├── utils/         # 工具函数
│       ├── App.tsx        # 应用根组件
│       └── main.tsx       # 渲染进程入口
├── docs/                  # 文档
├── .github/               # GitHub 配置
└── dist/                  # 构建输出
```

## 获取帮助

如果您有任何问题或需要帮助：

1. 查看 [README.md](README.md)
2. 查看 [文档目录](docs/)
3. 在 [Issues](https://github.com/maoka233/NovelCreat/issues) 中搜索类似问题
4. 创建新 Issue 提问

## 致谢

感谢所有为 NovelCreat 做出贡献的开发者！

---

再次感谢您的贡献！🎉
