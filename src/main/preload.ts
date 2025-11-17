import { contextBridge, ipcRenderer } from 'electron';

/**
 * Exposed API for renderer process
 */
contextBridge.exposeInMainWorld('novelAPI', {
  // File operations
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),

  // Environment variables (read-only, safe exposure)
  env: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
    DEEPSEEK_API_BASE_URL: process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com',
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});
