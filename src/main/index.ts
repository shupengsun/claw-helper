import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#666666',
      height: 38
    },
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

  ipcMain.handle('start-gateway', async () => {
    return new Promise((resolve) => {
      const command = process.platform === 'win32' ? 'openclaw' : 'openclaw'
      const args = ['gateway', 'start']

      const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore',
        shell: true
      })

      child.on('error', (error) => {
        console.error('Failed to start gateway:', error)
        resolve({ success: false, error: error.message })
      })

      child.on('exit', (code) => {
        if (code === 0 || code === null) {
          console.log('Gateway started successfully')
          resolve({ success: true })
        } else {
          console.error('Gateway exited with code:', code)
          resolve({ success: false, error: `Process exited with code ${code}` })
        }
      })

      setTimeout(() => {
        resolve({ success: true })
      }, 2000)
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
