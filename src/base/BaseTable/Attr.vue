<script setup lang="ts">
import CommonAttr from '../common/CommonAttr.vue'
import EditTable from './EditTable.vue'

const globalStore = useGlobalStore()
const propValue = globalStore.curComponent!.propValue as Record<string, any>
</script>

<template>
  <div class="attr-list v-table-attr">
    <CommonAttr />
    <EditTable />
    <el-form>
      <el-form-item label="斑马纹">
        <el-switch v-model="propValue.stripe" />
      </el-form-item>
      <el-form-item label="表头加粗">
        <el-switch v-model="propValue.thBold" />
      </el-form-item>
    </el-form>
  </div>
</template>
