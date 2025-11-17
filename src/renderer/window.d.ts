// src/renderer/window.d.ts

export {};

declare global {
  interface Window {
    novelAPI: {
      env: {
        DEEPSEEK_API_KEY: string;
        DEEPSEEK_API_BASE_URL: string;
        NODE_ENV: string;
      };
      // 你在 preload.ts 中暴露的其他 API 也可以放这里
      readFile: (filePath: string) => Promise<string>;
    };
  }
}