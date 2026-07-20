import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      minimize: () => void
      maximize: () => void
      close: () => void
      startGateway: () => Promise<{ success: boolean; error?: string }>
      openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
      onNewWindowRequest: (callback: (url: string) => void) => void
      removeNewWindowListener: () => void
      getVersions: () => Promise<{ app: string; electron: string; chrome: string }>
    }
  }
}
