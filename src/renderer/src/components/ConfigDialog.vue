<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', url: string): void
}>()

const url = ref('')

watch(() => props.modelValue, (newVal) => {
  url.value = newVal
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    url.value = props.modelValue
  }
})

function handleClose() {
  emit('close')
}

async function handleSave() {
  emit('save', url.value)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="config-overlay" @click.self="handleClose">
      <div class="config-dialog">
        <div class="config-header">
          <h3>配置 OpenClaw URL</h3>
        </div>
        <div class="config-content">
          <label class="config-label">URL 地址</label>
          <input 
            v-model="url" 
            type="text" 
            class="config-input"
            placeholder="请输入 OpenClaw 控制台地址"
          />
          <span class="config-example">示例：http://127.0.0.1:18789?token=xxx</span>
        </div>
        <div class="config-footer">
          <button class="config-btn cancel-btn" @click="handleClose">取消</button>
          <button class="config-btn confirm-btn" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.config-overlay {
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

.config-dialog {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 400px;
  overflow: hidden;
}

.config-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.config-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.config-content {
  padding: 20px;
}

.config-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.config-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
}

.config-input:focus {
  border-color: #4facfe;
}

.config-example {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.config-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.config-btn {
  padding: 6px 16px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e5e5e5;
}

.confirm-btn {
  background: #4facfe;
  color: #ffffff;
}

.confirm-btn:hover {
  background: #3a8fe8;
}
</style>