import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  startGateway: () => ipcRenderer.invoke('start-gateway'),
  executeCommand: (command: string) => ipcRenderer.invoke('execute-command', command),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  onNewWindowRequest: (callback: (url: string) => void) => {
    ipcRenderer.on('new-window-request', (_event, url) => callback(url))
  },
  removeNewWindowListener: () => {
    ipcRenderer.removeAllListeners('new-window-request')
  },
  getVersions: () => ipcRenderer.invoke('get-versions'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: Record<string, unknown>) => ipcRenderer.invoke('save-config', config)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
