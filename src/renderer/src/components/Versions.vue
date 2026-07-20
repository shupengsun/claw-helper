<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { versions } from 'process'

const electronVersion = ref('')
const nodeVersion = ref('')
const chromeVersion = ref('')

onMounted(() => {
  electronVersion.value = versions.electron
  nodeVersion.value = versions.node
  chromeVersion.value = versions.chrome
})
</script>

<template>
  <div class="versions">
    <span>Electron: {{ electronVersion }}</span>
    <span>Node: {{ nodeVersion }}</span>
    <span>Chrome: {{ chromeVersion }}</span>
  </div>
</template>

<style scoped>
.versions {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.versions span {
  font-size: 14px;
  color: #666;
}
</style>
