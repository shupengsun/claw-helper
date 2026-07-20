<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const appVersion = ref('1.0.0')
const electronVersion = ref('')
const chromeVersion = ref('')

onMounted(async () => {
  try {
    const versions = await window.api.getVersions()
    appVersion.value = versions.app
    electronVersion.value = versions.electron
    chromeVersion.value = versions.chrome
  } catch (error) {
    console.error('Failed to get versions:', error)
  }
})

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="about-overlay" @click.self="handleClose">
      <div class="about-dialog">
        <div class="about-header">
          <h3>关于 ClawHelper</h3>
        </div>
        <div class="about-content">
          <div class="version-item">
            <span class="version-label">应用版本：</span>
            <span class="version-value">{{ appVersion }}</span>
          </div>
          <div class="version-item">
            <span class="version-label">Chromium版本：</span>
            <span class="version-value">{{ chromeVersion }}</span>
          </div>
          <div class="version-item">
            <span class="version-label">Electron版本：</span>
            <span class="version-value">{{ electronVersion }}</span>
          </div>
        </div>
        <div class="about-footer">
          <button class="close-btn" @click="handleClose">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.about-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.about-dialog {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 320px;
  overflow: hidden;
}

.about-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.about-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.about-content {
  padding: 20px;
}

.version-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.version-label {
  color: #666;
}

.version-value {
  color: #333;
  font-weight: 500;
}

.about-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: #4facfe;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
}

.close-btn:hover {
  background: #3a8fe8;
}
</style>
