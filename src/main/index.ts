import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

const configPath = join(app.getPath('userData'), 'config.json')

function getConfig() {
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return {}
    }
  }
  return {}
}

function saveConfig(config: Record<string, unknown>) {
  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    ...(process.platform === 'darwin' ? {
      titleBarOverlay: {
        color: '#ffffff',
        symbolColor: '#666666',
        height: 38
      }
    } : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.maximize()

}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('web-contents-created', (_event, webContents) => {
    webContents.setWindowOpenHandler((details) => {
      if (mainWindow && webContents !== mainWindow.webContents) {
        mainWindow.webContents.send('new-window-request', details.url)
      } else {
        shell.openExternal(details.url)
      }
      return { action: 'deny' }
    })
  })

  ipcMain.handle('open-external', async (_, url) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error: unknown) {
      console.error('Failed to open external URL:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('get-versions', () => {
    return {
      app: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome
    }
  })

  ipcMain.handle('get-platform', () => {
    return process.platform
  })

  ipcMain.handle('get-config', () => {
    return getConfig()
  })

  ipcMain.handle('save-config', (_event, config: Record<string, unknown>) => {
    return saveConfig(config)
  })

  ipcMain.handle('execute-command', async (_event, command: string) => {
    try {
      let terminalCommand: string
      let args: string[]

      if (process.platform === 'darwin') {
        terminalCommand = 'osascript'
        args = ['-e', `tell application "Terminal" to do script "${command}"`]
      } else if (process.platform === 'win32') {
        terminalCommand = 'cmd.exe'
        args = ['/c', `start cmd /k "${command}"`]
      } else {
        terminalCommand = 'bash'
        args = ['-c', command]
      }

      spawn(terminalCommand, args, {
        detached: true,
        stdio: 'ignore',
        shell: true
      })

      return { success: true }
    } catch (error: unknown) {
      console.error('Failed to execute command:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // 窗口控制事件监听
  ipcMain.on('window-minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
  })

  ipcMain.on('window-close', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })


  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
