<script setup lang="ts">
import CommonAttr from '../common/CommonAttr.vue'

const globalStore = useGlobalStore()
const flip = computed(() =>
  (globalStore.curComponent!.propValue as Record<string, any>).flip,
)
</script>

<template>
  <div>
    <CommonAttr />
    <el-form>
      <el-form-item label="翻转:">
        <div style="clear: both">
          <el-checkbox v-model="flip.horizontal" label="horizontal">
            水平翻转
          </el-checkbox>
          <el-checkbox v-model="flip.vertical" label="vertical">
            垂直翻转
          </el-checkbox>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
