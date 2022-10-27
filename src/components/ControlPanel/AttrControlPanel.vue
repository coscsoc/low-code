<script setup lang="ts">
import { storeToRefs } from 'pinia'

const panelOptions: Record<string, string> = {
  color: '颜色',
  opacity: '不透明度',
  backgroundColor: '背景色',
  fontSize: '字体大小',
}
const globalStore = useGlobalStore()
const { canvasStyleData } = $(storeToRefs(globalStore))

const isShowColorPicker = (str: string) => str.toLowerCase().includes('color')
</script>

<template>
  <div class="attr-control-panel">
    <p class="title">
      画布属性
    </p>
    <el-form style="padding: 20px;">
      <el-form-item v-for="(key, index) in Object.keys(panelOptions)" :key="index" :label="panelOptions[key]">
        <el-color-picker v-if="isShowColorPicker(key)" v-model="canvasStyleData[key]" show-alpha />
        <el-input v-else v-model.number="canvasStyleData[key]" type="number" step="0.1" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.attr-control-panel {
    .title {
        text-align: center;
        margin-bottom: 10px;
        height: 40px;
        line-height: 40px;
        border-bottom: 2px solid  #e4e7ed;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
    }
}
</style>
