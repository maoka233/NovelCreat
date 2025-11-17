# 架构文档

本文档详细说明 NovelCreat 的系统架构、设计决策和技术实现。

## 目录

- [系统概述](#系统概述)
- [架构设计](#架构设计)
- [技术选型](#技术选型)
- [数据流](#数据流)
- [模块说明](#模块说明)
- [设计模式](#设计模式)
- [性能优化](#性能优化)
- [安全性](#安全性)

## 系统概述

NovelCreat 是一个基于 Electron 的跨平台桌面应用，采用现代化的前端技术栈构建。应用使用 React 构建用户界面，TypeScript 提供类型安全，集成 DeepSeek AI 提供智能写作辅助。

### 核心功能

1. **章节管理**: 创建、编辑、组织小说章节
2. **AI 辅助写作**: 智能内容生成、改写和润色
3. **知识库系统**: 管理角色、世界观、情节等信息
4. **上下文管理**: 维护故事一致性
5. **数据持久化**: 本地存储和备份

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Electron 应用                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐              ┌──────────────────┐    │
│  │  主进程       │              │  渲染进程         │    │
│  │ (Node.js)    │◄────IPC─────►│  (React)         │    │
│  │              │              │                  │    │
│  │ - 窗口管理    │              │ - UI 组件        │    │
│  │ - 文件系统    │              │ - 状态管理       │    │
│  │ - IPC 通信   │              │ - 业务逻辑       │    │
│  └──────────────┘              └──────────────────┘    │
│         │                              │               │
│         │                              ▼               │
│         ▼                      ┌──────────────────┐    │
│  ┌──────────────┐              │  Preload 脚本    │    │
│  │ 本地存储      │              │  (上下文桥接)     │    │
│  │ - SQLite     │              └──────────────────┘    │
│  │ - JSON Store │                      │               │
│  └──────────────┘                      ▼               │
└────────────────────────────┼────────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  外部 API         │
                    │  - DeepSeek AI   │
                    └──────────────────┘
```

### 三层架构

#### 1. 表现层 (Presentation Layer)

- **组件 (Components)**: React 组件，负责 UI 渲染
- **路由 (Routing)**: 页面导航和状态管理
- **样式 (Styling)**: Tailwind CSS 样式系统

#### 2. 业务逻辑层 (Business Logic Layer)

- **服务 (Services)**: 封装业务逻辑
- **状态管理 (State Management)**: Zustand stores
- **工具函数 (Utilities)**: 通用工具和辅助函数

#### 3. 数据层 (Data Layer)

- **存储服务 (Storage Service)**: 数据持久化
- **API 服务 (API Service)**: 外部 API 调用
- **数据模型 (Data Models)**: TypeScript 类型定义

## 技术选型

### 核心技术

| 技术         | 版本   | 用途         | 选择原因               |
| ------------ | ------ | ------------ | ---------------------- |
| Electron     | 31.3.0 | 桌面应用框架 | 跨平台支持，成熟生态   |
| React        | 18.3.1 | UI 框架      | 组件化开发，丰富生态   |
| TypeScript   | 5.5.4  | 类型系统     | 类型安全，提高代码质量 |
| Vite         | 5.4.1  | 构建工具     | 快速的开发体验         |
| Zustand      | 4.5.5  | 状态管理     | 轻量级，易于使用       |
| Tailwind CSS | 3.4.10 | CSS 框架     | 快速开发，一致性好     |

### 为什么选择这些技术？

#### Electron

- **跨平台**: 一次开发，多平台部署
- **Web 技术**: 使用熟悉的前端技术栈
- **原生能力**: 访问文件系统、系统 API
- **社区支持**: 大量的插件和工具

#### React

- **组件化**: 可复用的 UI 组件
- **虚拟 DOM**: 高效的 UI 更新
- **生态系统**: 丰富的第三方库
- **开发体验**: 良好的开发工具支持

#### TypeScript

- **类型安全**: 编译时错误检查
- **智能提示**: 更好的 IDE 支持
- **重构友好**: 大规模代码库维护
- **文档作用**: 类型即文档

#### Zustand

- **简单**: 最小化的 API
- **性能**: 高效的状态更新
- **TypeScript**: 原生 TypeScript 支持
- **灵活**: 不强制特定架构

## 数据流

### 用户交互流程

```
用户操作
   │
   ▼
React 组件
   │
   ▼
事件处理
   │
   ├──► Zustand Store (状态更新)
   │         │
   │         ▼
   │    组件重新渲染
   │
   └──► Service 层
         │
         ├──► DeepSeek API (AI 功能)
         │         │
         │         ▼
         │    处理响应
         │         │
         │         ▼
         │    更新 Store
         │
         └──► Storage Service (数据持久化)
                   │
                   ▼
              electron-store / SQLite
```

### 状态管理流程

```
组件触发 Action
        │
        ▼
   Zustand Action
        │
        ├──► 同步更新状态
        │         │
        │         ▼
        │    通知订阅的组件
        │
        └──► 异步操作 (Service 调用)
                  │
                  ▼
             更新状态
                  │
                  ▼
             持久化存储
```

## 模块说明

### 主进程 (Main Process)

**职责:**

- 创建和管理应用窗口
- 处理系统级事件
- 提供原生 API 访问
- IPC 通信处理

**关键文件:**

- `src/main/index.ts`: 主进程入口
- `src/main/preload.ts`: Preload 脚本，暴露安全的 API

### 渲染进程 (Renderer Process)

#### 组件层 (Components)

**UI 组件:**

- `ChapterEditor`: 章节编辑器
- `ChapterManager`: 章节管理器
- `OutlineGenerator`: 大纲生成器
- `StyleSelector`: 风格选择器
- `ThemeToggle`: 主题切换
- `WordCount`: 字数统计
- `AutoSave`: 自动保存指示器

**组件设计原则:**

- 单一职责
- 可复用性
- Props 类型定义
- 受控组件优先

#### 服务层 (Services)

**核心服务:**

1. **DeepSeekService**
   - AI 内容生成
   - API 调用封装
   - Token 管理

2. **KnowledgeManager**
   - 知识库管理
   - 实体关系维护
   - 一致性检查

3. **StorageService**
   - 数据持久化
   - 文件操作
   - 备份管理

4. **ContextManager**
   - 上下文构建
   - 动态上下文管理
   - 上下文压缩

5. **OutlineGenerator**
   - 大纲生成
   - 结构化输出
   - 章节规划

6. **ExportService**
   - 内容导出
   - 格式转换
   - 批量操作

7. **BackupService**
   - 自动备份
   - 备份恢复
   - 备份历史

#### 状态管理 (Stores)

**Store 设计:**

1. **knowledgeStore**
   - 知识库状态
   - 角色、世界观、情节数据
   - CRUD 操作

2. **themeStore**
   - 主题设置
   - UI 偏好

3. **editorStore**
   - 编辑器状态
   - 字数统计
   - 自动保存状态

**Store 模式:**

```typescript
interface Store {
  // 状态
  state: State;

  // 同步 actions
  setState: (state: Partial<State>) => void;

  // 异步 actions
  asyncAction: () => Promise<void>;
}
```

## 设计模式

### 1. 服务定位器模式 (Service Locator)

服务层使用单例模式，全局可访问：

```typescript
// 服务实例
const deepSeekService = new DeepSeekService();

// 在组件中使用
function MyComponent() {
  const generate = async () => {
    await deepSeekService.generateChapter(...);
  };
}
```

### 2. 观察者模式 (Observer)

Zustand 实现了观察者模式，组件订阅状态变化：

```typescript
const useKnowledgeStore = create(set => ({
  characters: [],
  addCharacter: character =>
    set(state => ({
      characters: [...state.characters, character]
    }))
}));
```

### 3. 策略模式 (Strategy)

不同的导出格式使用策略模式：

```typescript
interface ExportStrategy {
  export(content: string): string;
}

class TxtExporter implements ExportStrategy {
  export(content: string): string { ... }
}

class MarkdownExporter implements ExportStrategy {
  export(content: string): string { ... }
}
```

### 4. 工厂模式 (Factory)

上下文构建使用工厂模式：

```typescript
class ContextFactory {
  static createContext(type: string): Context {
    switch (type) {
      case 'chapter':
        return new ChapterContext();
      case 'outline':
        return new OutlineContext();
      default:
        throw new Error('Unknown context type');
    }
  }
}
```

## 性能优化

### 1. 渲染优化

- **React.memo**: 防止不必要的重渲染
- **useMemo / useCallback**: 缓存计算结果和回调函数
- **虚拟滚动**: 大列表使用虚拟滚动
- **代码分割**: 按需加载组件

### 2. 状态管理优化

- **选择性订阅**: 只订阅需要的状态
- **批量更新**: 合并多个状态更新
- **状态分片**: 避免单一大型 store

### 3. 数据处理优化

- **防抖/节流**: 限制高频操作
- **缓存策略**: 缓存计算结果和 API 响应
- **异步加载**: 大型数据异步加载

### 4. 网络优化

- **请求合并**: 合并多个 API 请求
- **请求取消**: 取消过期请求
- **离线支持**: 缓存关键数据

## 安全性

### 1. Electron 安全

- **上下文隔离**: 启用 `contextIsolation`
- **禁用 Node 集成**: `nodeIntegration: false`
- **Preload 脚本**: 仅暴露必要的 API
- **CSP**: 内容安全策略

### 2. 数据安全

- **环境变量**: API Key 使用环境变量
- **加密存储**: 敏感数据加密存储
- **输入验证**: 验证所有用户输入
- **XSS 防护**: 防止跨站脚本攻击

### 3. API 安全

- **密钥管理**: 安全的密钥存储
- **请求验证**: 验证 API 响应
- **错误处理**: 不暴露敏感错误信息
- **速率限制**: 防止 API 滥用

## 扩展性考虑

### 1. 插件系统

预留插件接口，支持第三方扩展：

```typescript
interface Plugin {
  name: string;
  version: string;
  activate(): void;
  deactivate(): void;
}
```

### 2. 多语言支持

使用国际化框架，支持多语言：

```typescript
interface I18n {
  t(key: string, params?: object): string;
  setLocale(locale: string): void;
}
```

### 3. 主题系统

可扩展的主题系统：

```typescript
interface Theme {
  colors: ColorScheme;
  fonts: FontScheme;
  spacing: SpacingScheme;
}
```

## 测试策略

### 1. 单元测试

- 工具函数测试
- Service 层测试
- Store 逻辑测试

### 2. 组件测试

- React 组件测试
- 交互测试
- 快照测试

### 3. 集成测试

- API 集成测试
- 数据流测试
- E2E 测试

## 构建和部署

### 开发构建

```bash
npm run dev  # 开发模式，支持热重载
```

### 生产构建

```bash
npm run build  # 构建生产版本
```

### 打包

```bash
npm run electron:build  # 打包为可执行文件
```

## 未来计划

- [ ] 实现完整的插件系统
- [ ] 添加多语言支持
- [ ] 实现云同步功能
- [ ] 添加协作编辑
- [ ] 支持更多 AI 模型
- [ ] 性能监控和分析
- [ ] 自动化测试覆盖

## 相关文档

- [API 文档](API.md)
- [开发指南](DEVELOPMENT.md)
- [贡献指南](../CONTRIBUTING.md)

---

如有问题或建议，请在 [GitHub Issues](https://github.com/maoka233/NovelCreat/issues) 中反馈。
