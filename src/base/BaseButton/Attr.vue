<script setup lang="ts">
import CommonAttr from '../common/CommonAttr.vue'

const globalStore = useGlobalStore()
</script>

<template>
  <div>
    <CommonAttr />
    <el-form>
      <el-form-item label="内容">
        <el-input v-model="globalStore.curComponent!.propValue" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
  </div>
</template>
