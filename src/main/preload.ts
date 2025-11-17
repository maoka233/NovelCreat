import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('novelAPI', {
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath)
});
