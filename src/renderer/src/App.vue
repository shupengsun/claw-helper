<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Home from './components/Home.vue'
import AboutDialog from './components/AboutDialog.vue'
import ConfigDialog from './components/ConfigDialog.vue'

interface Tab {
  id: string
  title: string
  url?: string
  favicon?: string
  isLoading: boolean
}

const tabs = ref<Tab[]>([
  {
    id: 'home',
    title: '首页',
    isLoading: false
  },
  {
    id: 'main',
    title: 'OpenClaw控制台',
    url: '',
    isLoading: true
  }
])

const activeTabId = ref('home')
const isCommandMenuOpen = ref(false)
const isSettingsMenuOpen = ref(false)
const isAboutDialogVisible = ref(false)
const isConfigDialogVisible = ref(false)
const openClawUrl = ref('')
const platform = ref('')

const loadingTimeouts = ref<Record<string, ReturnType<typeof setTimeout> | null>>({})


function switchTab(tabId: string) {
  if (tabId === 'main') {
    const mainTab = tabs.value.find(t => t.id === 'main')
    if (!mainTab?.url || mainTab.url.trim() === '') {
      alert('请先配置 OpenClaw URL，点击【设置】->【配置OpenClaw URL】进行配置')
      return
    }
  }
  activeTabId.value = tabId
}



function startLoadingTimeout(tabId: string) {
  if (loadingTimeouts.value[tabId]) {
    clearTimeout(loadingTimeouts.value[tabId]!)
  }
  loadingTimeouts.value[tabId] = setTimeout(() => {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      tab.isLoading = false
    }
  }, 10000)
}

function onDidStartLoading(tabId: string) {
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isLoading = true
    startLoadingTimeout(tabId)
  }
}

function onDidFinishLoading(tabId: string) {
  if (loadingTimeouts.value[tabId]) {
    clearTimeout(loadingTimeouts.value[tabId]!)
    loadingTimeouts.value[tabId] = null
  }
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isLoading = false
  }
}

function onDomReady(tabId: string, _event: Event) {
  if (loadingTimeouts.value[tabId]) {
    clearTimeout(loadingTimeouts.value[tabId]!)
    loadingTimeouts.value[tabId] = null
  }
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isLoading = false
  }
}

function onPageFaviconUpdated(tabId: string, event: Event) {
  const favicons = (event as CustomEvent).detail.favicons
  if (favicons && favicons.length > 0) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      tab.favicon = favicons[0]
    }
  }
}

function onDidFrameFinishLoad(tabId: string) {
  if (loadingTimeouts.value[tabId]) {
    clearTimeout(loadingTimeouts.value[tabId]!)
    loadingTimeouts.value[tabId] = null
  }
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isLoading = false
  }
}

function onDidFailLoad(tabId: string) {
  if (loadingTimeouts.value[tabId]) {
    clearTimeout(loadingTimeouts.value[tabId]!)
    loadingTimeouts.value[tabId] = null
  }
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isLoading = false
  }
}

function onPageTitleUpdated(tabId: string, event: Event) {
  const title = (event as CustomEvent).detail.title
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab && title) {
    tab.title = title
  }
}



function toggleCommandMenu() {
  isCommandMenuOpen.value = !isCommandMenuOpen.value
  isSettingsMenuOpen.value = false
}

function toggleSettingsMenu() {
  isSettingsMenuOpen.value = !isSettingsMenuOpen.value
  isCommandMenuOpen.value = false
}

function handleAboutClick() {
  isSettingsMenuOpen.value = false
  isAboutDialogVisible.value = true
}

function handleAboutClose() {
  isAboutDialogVisible.value = false
}

function handleConfigUrlClick() {
  isSettingsMenuOpen.value = false
  isConfigDialogVisible.value = true
}

function handleConfigUrlClose() {
  isConfigDialogVisible.value = false
}

async function handleMinimize() {
  window.api.minimize()
}

function handleMaximize() {
  window.api.maximize()
}

function handleClose() {
  window.api.close()
}

async function handleConfigSave(url: string) {
  try {
    const config = await window.api.getConfig()
    await window.api.saveConfig({ ...config, openClawUrl: url })
    openClawUrl.value = url
    const mainTab = tabs.value.find(t => t.id === 'main')
    if (mainTab) {
      mainTab.url = url
      mainTab.isLoading = true
      startLoadingTimeout('main')
    }
    isConfigDialogVisible.value = false
  } catch (error) {
    console.error('Failed to save config:', error)
  }
}

async function handleCommandAction(action: string) {
  console.log('Command action:', action)
  isCommandMenuOpen.value = false

  const commands: Record<string, string> = {
    start: 'openclaw gateway start',
    restart: 'openclaw gateway restart',
    stop: 'openclaw gateway stop',
    bindWechat: 'openclaw channels login --channel openclaw-weixin'
  }

  const command = commands[action]
  if (!command) {
    console.error('Unknown command action:', action)
    return
  }

  try {
    const result = await window.api.executeCommand(command)
    console.log('Execute command result:', result)
  } catch (error) {
    console.error('Failed to execute command:', error)
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.command-menu-container')) {
    isCommandMenuOpen.value = false
  }
  if (!target.closest('.settings-menu-container')) {
    isSettingsMenuOpen.value = false
  }
}

function createNewTab(url: string) {
  const newId = `tab-${Date.now()}`
  const newTab: Tab = {
    id: newId,
    title: url,
    url: url,
    isLoading: true
  }
  tabs.value.push(newTab)
  activeTabId.value = newId
  startLoadingTimeout(newId)
}

function closeTab(tabId: string) {
  const index = tabs.value.findIndex(t => t.id === tabId)
  if (index > -1) {
    tabs.value.splice(index, 1)
    if (activeTabId.value === tabId) {
      activeTabId.value = tabs.value[Math.min(index, tabs.value.length - 1)]?.id || 'home'
    }
  }
}

onMounted(async () => {
  tabs.value.forEach(tab => {
    if (tab.url !== 'about:blank') {
      startLoadingTimeout(tab.id)
    }
  })
  document.addEventListener('click', handleClickOutside)
  window.api.onNewWindowRequest((url) => {
    createNewTab(url)
  })
  try {
    platform.value = await window.api.getPlatform()
    const config = await window.api.getConfig()
    if (config.openClawUrl) {
      openClawUrl.value = String(config.openClawUrl)
      const mainTab = tabs.value.find(t => t.id === 'main')
      if (mainTab) {
        mainTab.url = openClawUrl.value
      }
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
})

onUnmounted(() => {
  Object.values(loadingTimeouts.value).forEach(timeout => {
    if (timeout) clearTimeout(timeout)
  })
  document.removeEventListener('click', handleClickOutside)
  window.api.removeNewWindowListener()
})
</script>

<template>
  <div class="app-container">
    <div class="titlebar-area">
      <div v-if="platform === 'darwin'" class="traffic-lights-placeholder"></div>
      <div class="nav-links">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="nav-link" 
          :class="{ active: activeTabId === tab.id }"
          @click="switchTab(tab.id)"
        >
          <svg v-if="tab.id === 'home'" class="nav-icon home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <img v-else-if="tab.favicon" :src="tab.favicon" class="nav-icon" />
          <svg v-else class="nav-icon default-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="21.17" y1="8" x2="12" y2="8"></line>
            <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
            <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
          </svg>
          {{ tab.title }}
          <button 
            v-if="tab.id !== 'home' && tab.id !== 'main'" 
            class="close-tab-btn"
            @click.stop="closeTab(tab.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </button>
      </div>
      <div class="command-menu-container">
        <button 
          class="command-menu-btn"
          @click.stop="toggleCommandMenu"
        >
          命令
        </button>
        <div v-if="isCommandMenuOpen" class="command-menu-dropdown">
          <button class="menu-item" @click="handleCommandAction('start')">启动</button>
          <button class="menu-item" @click="handleCommandAction('restart')">重启</button>
          <button class="menu-item" @click="handleCommandAction('stop')">停止</button>
          <div class="menu-divider"></div>
          <button class="menu-item" @click="handleCommandAction('bindWechat')">绑定微信</button>
        </div>
      </div>
      <div class="settings-menu-container">
        <button 
          class="settings-menu-btn"
          @click.stop="toggleSettingsMenu"
        >
          设置
        </button>
        <div v-if="isSettingsMenuOpen" class="settings-menu-dropdown">
          <button class="menu-item" @click="handleConfigUrlClick">配置OpenClaw URL</button>
          <button class="menu-item" @click="handleAboutClick">关于</button>
        </div>
      </div>
      <div v-if="platform === 'win32'" class="window-control">
        <button class="window-btn window-min" @click="handleMinimize" title="最小化">
          <svg width="14" height="14" viewBox="0 0 10 10" fill="none" stroke-width="1">
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="window-btn window-max" @click="handleMaximize" title="最大化">
          <svg width="14" height="14" viewBox="0 0 10 10" fill="none" stroke-width="1">
            <rect x="1" y="1" width="8" height="8" stroke="currentColor" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="window-btn window-close" @click="handleClose" title="关闭">
          <svg width="14" height="14" viewBox="0 0 10 10" fill="none" stroke-width="1">
            <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor"  stroke-linecap="round"/>
            <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor"  stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    <AboutDialog :visible="isAboutDialogVisible" @close="handleAboutClose" />
    <ConfigDialog 
      :visible="isConfigDialogVisible" 
      :model-value="openClawUrl"
      @close="handleConfigUrlClose" 
      @save="handleConfigSave" 
    />
    <main class="main-content">
      <div v-for="tab in tabs" :key="tab.id" v-show="activeTabId === tab.id" class="page-container">
        <webview
          v-if="tab.url && tab.url !== 'about:blank'"
          :src="tab.url"
          class="remote-content"
          allowpopups
          @did-start-loading="() => onDidStartLoading(tab.id)"
          @did-finish-loading="() => onDidFinishLoading(tab.id)"
          @dom-ready="(e) => onDomReady(tab.id, e)"
          @did-frame-finish-load="() => onDidFrameFinishLoad(tab.id)"
          @did-fail-load="() => onDidFailLoad(tab.id)"
          @page-title-updated="(e) => onPageTitleUpdated(tab.id, e)"
          @page-favicon-updated="(e) => onPageFaviconUpdated(tab.id, e)"
        ></webview>
        <Home v-else-if="tab.id === 'home'" />
        <div v-if="tab.isLoading && tab.url && tab.url !== 'about:blank'" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p class="loading-text">加载中...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.titlebar-area {
  height: 38px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 12px;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e5e5;
  -webkit-app-region: drag;
  user-select: none;
}

.traffic-lights-placeholder {
  width: 52px;
  -webkit-app-region: no-drag;
}

.nav-links {
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
  margin-left: 20px;
  overflow-x: auto;
  flex: 1;
}

.nav-link {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 0 12px;
  height: 38px;
  width: 132px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.nav-icon {
  font-size: 14px;
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
}

.home-icon {
  width: 14px;
  height: 14px;
}

.default-icon {
  width: 14px;
  height: 14px;
}

.close-tab-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  flex-shrink: 0;
}

.close-tab-btn:hover {
  color: #333;
}

.close-tab-btn svg {
  width: 12px;
  height: 12px;
}

.nav-link:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}

.nav-link.active {
  color: #333333;
  background: #ffffff;
}



.main-content {
  flex: 1;
  overflow: hidden;
}

.page-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.remote-content {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}



.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e5e5;
  border-top-color: #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

.command-menu-container {
  -webkit-app-region: no-drag;
  position: relative;
}

.settings-menu-container {
  -webkit-app-region: no-drag;
  position: relative;
  margin-left: 8px;
}

.command-menu-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
}

.command-menu-btn:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}

.settings-menu-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
}

.settings-menu-btn:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}

.settings-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 160px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 200;
  margin-top: 4px;
  padding: 4px 0;
}

.command-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 200;
  margin-top: 4px;
  padding: 4px 0;
}

.menu-item {
  width: 100%;
  background: none;
  border: none;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 16px;
  text-align: left;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-divider {
  height: 1px;
  background: #e5e5e5;
  margin: 4px 0;
}

.window-control {
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.window-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.window-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.window-btn svg {
  width: 14px;
  height: 14px;
}

.window-close:hover {
  background: #e81123;
  color: white;
}
</style>
