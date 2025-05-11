import { contextBridge } from 'electron';

// Expose API to the renderer process
contextBridge.exposeInMainWorld('api', {
  // You can add IPC communication methods here if needed
  // Example: send: (channel: string, data: any) => ipcRenderer.send(channel, data)
});

console.log('Preload script loaded');