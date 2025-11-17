# Novel Writer

Electron + React + TypeScript 桌面端项目，用于 AI 辅助小说创作。整合 Tailwind CSS、Zustand、SQLite/JSON 存储以及 DeepSeek API 接口骨架。

## 开发环境

```bash
npm install
npm run dev
```

- `npm run dev`: 启动 Vite 渲染进程和 Electron 主进程（需要 `VITE_DEV_SERVER_URL` 自动注入）。
- `npm run build`: 构建前端与主进程并使用 electron-builder 打包。
- `npm run typecheck` / `npm run lint`: 基础质量检查。

在 `DeepSeekService` 中补充真实 API Key 和请求逻辑即可完成云端调用。

## 目录

```
novel-writer/
├── src/
│   ├── main/            # Electron 主进程
│   └── renderer/        # React 渲染进程
│       ├── components/  # UI 组件
│       ├── services/    # AI & 知识库逻辑
│       ├── stores/      # Zustand 状态
│       └── types/       # TS 类型
├── electron-builder.json
├── index.html
└── package.json
```
