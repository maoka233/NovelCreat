# 开发文档

本文档详细说明 NovelCreat 的开发环境配置、开发流程和最佳实践。

## 目录

- [开发环境配置](#开发环境配置)
- [项目结构](#项目结构)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)
- [开发工具](#开发工具)

## 开发环境配置

### 系统要求

- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Git**: >= 2.0.0

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/maoka233/NovelCreat.git
cd NovelCreat
```

#### 2. 安装依赖

```bash
npm install
```

这将安装所有生产和开发依赖，并自动运行 Husky 的 `prepare` 脚本配置 Git hooks。

#### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加您的 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your_actual_api_key_here
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
```

#### 4. 验证安装

运行以下命令验证环境配置：

```bash
npm run typecheck  # TypeScript 类型检查
npm run lint       # 代码检查
```

如果没有错误，说明环境配置成功。

### 开发服务器

启动开发服务器：

```bash
npm run dev
```

这将同时启动：

- Vite 开发服务器 (端口 5173)
- Electron 应用 (自动连接到 Vite 服务器)

开发服务器支持：

- 热模块替换 (HMR)
- 自动重载
- DevTools 集成

## 项目结构

```
NovelCreat/
├── .github/                    # GitHub 配置
│   ├── ISSUE_TEMPLATE/         # Issue 模板
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/              # CI/CD 工作流
│   │   └── ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                       # 文档
│   ├── API.md                  # API 使用文档
│   ├── ARCHITECTURE.md         # 架构设计文档
│   └── DEVELOPMENT.md          # 本文档
│
├── src/                        # 源代码
│   ├── main/                   # Electron 主进程
│   │   ├── index.ts            # 主进程入口
│   │   └── preload.ts          # Preload 脚本
│   │
│   └── renderer/               # React 渲染进程
│       ├── components/         # React 组件
│       │   ├── AutoSave.tsx
│       │   ├── ChapterEditor.tsx
│       │   ├── ChapterManager.tsx
│       │   ├── OutlineGenerator.tsx
│       │   ├── StyleSelector.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── WordCount.tsx
│       │
│       ├── services/           # 业务逻辑服务
│       │   ├── BackupService.ts
│       │   ├── ContextManager.ts
│       │   ├── DeepSeekService.ts
│       │   ├── ExportService.ts
│       │   ├── KnowledgeManager.ts
│       │   ├── OutlineGenerator.ts
│       │   └── StorageService.ts
│       │
│       ├── stores/             # Zustand 状态管理
│       │   ├── editorStore.ts
│       │   ├── knowledgeStore.ts
│       │   └── themeStore.ts
│       │
│       ├── types/              # TypeScript 类型定义
│       │   └── index.ts
│       │
│       ├── utils/              # 工具函数
│       │   ├── format.ts
│       │   └── validation.ts
│       │
│       ├── config/             # 配置文件
│       │   └── env.ts
│       │
│       ├── App.tsx             # 应用根组件
│       ├── main.tsx            # 渲染进程入口
│       └── styles.css          # 全局样式
│
├── .env.example                # 环境变量模板
├── .eslintrc.cjs               # ESLint 配置
├── .gitignore                  # Git 忽略文件
├── .lintstagedrc               # lint-staged 配置
├── .prettierignore             # Prettier 忽略文件
├── .prettierrc                 # Prettier 配置
├── CHANGELOG.md                # 变更日志
├── CONTRIBUTING.md             # 贡献指南
├── LICENSE                     # MIT 许可证
├── README.md                   # 项目说明
├── electron-builder.json       # Electron Builder 配置
├── index.html                  # HTML 入口
├── package.json                # 项目配置
├── postcss.config.cjs          # PostCSS 配置
├── tailwind.config.cjs         # Tailwind CSS 配置
├── tsconfig.electron.json      # Electron TypeScript 配置
├── tsconfig.json               # 渲染进程 TypeScript 配置
└── vite.config.ts              # Vite 配置
```

### 目录说明

#### src/main/ - 主进程

- 管理应用窗口
- 处理系统事件
- 提供 IPC 通信
- 访问 Node.js API

#### src/renderer/ - 渲染进程

- React 应用代码
- UI 组件和逻辑
- 状态管理
- 业务逻辑

## 开发流程

### 1. 创建新功能

#### Step 1: 创建分支

```bash
git checkout -b feature/your-feature-name
```

#### Step 2: 开发功能

遵循以下步骤：

1. **类型定义** - 在 `src/renderer/types/` 中定义类型
2. **Service 层** - 在 `src/renderer/services/` 中实现业务逻辑
3. **Store** - 在 `src/renderer/stores/` 中管理状态
4. **组件** - 在 `src/renderer/components/` 中创建 UI
5. **集成** - 在 `App.tsx` 中集成新功能

#### Step 3: 测试

```bash
npm run dev        # 本地测试
npm run lint       # 代码检查
npm run typecheck  # 类型检查
npm run build      # 构建测试
```

#### Step 4: 提交

```bash
git add .
git commit -m "feat: 添加新功能描述"
```

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

#### Step 5: 推送和创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

### 2. 修复 Bug

#### Step 1: 创建分支

```bash
git checkout -b fix/bug-description
```

#### Step 2: 修复 Bug

1. 定位问题
2. 编写修复代码
3. 测试验证

#### Step 3: 提交

```bash
git commit -m "fix: 修复某个问题的描述"
```

### 3. 更新文档

文档修改也需要遵循相同的流程：

```bash
git checkout -b docs/update-description
# 修改文档
git commit -m "docs: 更新文档描述"
```

## 代码规范

### TypeScript 规范

#### 1. 类型定义

**✅ 推荐:**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // ...
}
```

**❌ 不推荐:**

```typescript
function getUser(id: any): any {
  // ...
}
```

#### 2. 函数声明

**✅ 推荐:**

```typescript
// 明确的参数和返回类型
async function fetchData(url: string): Promise<Data> {
  // ...
}
```

**❌ 不推荐:**

```typescript
// 隐式 any
async function fetchData(url) {
  // ...
}
```

#### 3. 组件 Props

**✅ 推荐:**

```typescript
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
  // ...
};
```

### React 规范

#### 1. 组件结构

```typescript
import React from 'react';

// Props 类型
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 组件定义
const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // Hooks
  const [state, setState] = React.useState(0);

  // 事件处理
  const handleClick = () => {
    onAction();
  };

  // 渲染
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
};

export default MyComponent;
```

#### 2. Hooks 使用

**✅ 推荐:**

```typescript
// 在函数顶部使用 Hooks
const MyComponent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // 使用 useCallback 缓存回调
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  // 使用 useMemo 缓存计算
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(count);
  }, [count]);

  return <div>{/* ... */}</div>;
};
```

#### 3. 条件渲染

**✅ 推荐:**

```typescript
{isLoading ? <Spinner /> : <Content />}
{error && <ErrorMessage error={error} />}
```

### 命名规范

#### 1. 文件命名

- **组件**: PascalCase - `ChapterEditor.tsx`
- **Service**: camelCase - `deepSeekService.ts`
- **Store**: camelCase - `knowledgeStore.ts`
- **工具**: camelCase - `formatUtils.ts`

#### 2. 变量命名

- **变量/函数**: camelCase - `userName`, `getUserData()`
- **常量**: UPPER_SNAKE_CASE - `API_BASE_URL`, `MAX_RETRY_COUNT`
- **类/接口**: PascalCase - `UserManager`, `DataInterface`
- **私有成员**: 前缀 `_` - `_internalState`

#### 3. 组件命名

```typescript
// 组件文件: ChapterEditor.tsx
export const ChapterEditor: React.FC<ChapterEditorProps> = () => {
  // ...
};
```

### 代码风格

使用 Prettier 和 ESLint 自动格式化：

```bash
npm run format      # 格式化所有文件
npm run lint        # 检查代码问题
```

## 调试技巧

### 1. Chrome DevTools

Electron 应用自动打开 DevTools：

- **Console**: 查看日志和错误
- **Sources**: 设置断点调试
- **Network**: 监控网络请求
- **Application**: 检查存储数据

### 2. React DevTools

安装 React DevTools 扩展查看组件树和状态。

### 3. 日志调试

```typescript
// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// 使用有意义的日志前缀
console.log('[DeepSeekService] Generating chapter...');
console.error('[StorageService] Failed to save:', error);
```

### 4. Electron 主进程调试

在主进程中使用 console.log，输出会显示在终端：

```typescript
// src/main/index.ts
console.log('Main process started');
```

### 5. 性能分析

使用 React Profiler 分析组件性能：

```typescript
import { Profiler } from 'react';

<Profiler id="ChapterEditor" onRender={onRenderCallback}>
  <ChapterEditor />
</Profiler>
```

## 常见问题

### 1. npm install 失败

**解决方案:**

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 2. Electron 启动失败

**解决方案:**

```bash
# 确保 Vite 开发服务器已启动
# 检查端口 5173 是否被占用
lsof -i :5173

# 或使用不同端口
VITE_PORT=5174 npm run dev
```

### 3. TypeScript 错误

**解决方案:**

```bash
# 重新生成类型定义
npm run typecheck

# 检查 tsconfig.json 配置
# 确保所有依赖都有类型定义
```

### 4. 样式不生效

**解决方案:**

```bash
# 重启开发服务器
# 检查 Tailwind CSS 配置
# 确保 styles.css 被正确导入
```

### 5. Git hooks 不工作

**解决方案:**

```bash
# 重新安装 Husky
npx husky install

# 确保 hooks 有执行权限
chmod +x .husky/*
```

## 开发工具

### 推荐的 VS Code 扩展

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **TypeScript and JavaScript Language Features** - TS 支持
- **Tailwind CSS IntelliSense** - Tailwind 提示
- **GitLens** - Git 增强
- **Thunder Client** - API 测试

### VS Code 配置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 快捷键

- `Ctrl/Cmd + P` - 快速打开文件
- `Ctrl/Cmd + Shift + F` - 全局搜索
- `F12` - 跳转到定义
- `Alt + Shift + F` - 格式化代码
- `Ctrl/Cmd + /` - 切换注释

## 性能优化建议

### 1. 组件优化

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useCallback` 和 `useMemo` 缓存
- 避免在渲染函数中创建新对象/数组

### 2. 状态管理优化

- 只订阅需要的状态片段
- 避免深层嵌套的状态结构
- 合理使用状态拆分

### 3. 打包优化

- 代码分割和懒加载
- Tree shaking
- 压缩和混淆

## 安全注意事项

### 1. 环境变量

- 永远不要提交 `.env` 文件
- 使用 `.env.example` 作为模板
- 在生产环境使用环境变量

### 2. API Key 管理

- 不要在代码中硬编码 API Key
- 使用环境变量或安全的存储
- 定期轮换 API Key

### 3. Electron 安全

- 启用上下文隔离
- 禁用 Node 集成
- 使用 Preload 脚本暴露 API
- 验证所有用户输入

## 发布流程

### 1. 版本更新

```bash
# 更新版本号
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

### 2. 更新 CHANGELOG

在 `CHANGELOG.md` 中记录变更。

### 3. 构建

```bash
npm run build
```

### 4. 发布

```bash
git push --tags
# 在 GitHub 创建 Release
```

## 相关资源

### 官方文档

- [Electron 文档](https://www.electronjs.org/docs)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)

### 社区资源

- [Electron 示例](https://github.com/electron/electron-quick-start)
- [React 模式](https://reactpatterns.com/)
- [TypeScript 最佳实践](https://github.com/typescript-cheatsheets/react)

### 项目文档

- [API 文档](API.md)
- [架构文档](ARCHITECTURE.md)
- [贡献指南](../CONTRIBUTING.md)

---

如有问题或建议，请在 [GitHub Issues](https://github.com/maoka233/NovelCreat/issues) 中反馈。
