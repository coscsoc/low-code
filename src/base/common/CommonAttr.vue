<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Request from './Request.vue'
import Linkage from './Linkage.vue'
import { SelectKey, optionMap, selectKey, styleData } from './attrConfig'
const globalStore = useGlobalStore()
const { curComponent } = $(storeToRefs(globalStore))
const collapseActiveValue = ref('')

if (globalStore.curComponent)
  collapseActiveValue.value = globalStore.curComponent.collapseName || ''
const handleChange = () => {
  globalStore.curComponent!.collapseName = collapseActiveValue.value
}

const styleKeys = computed(() => {
  if (!globalStore.curComponent)
    return []
  const compStyleKeyMap = Object.keys(globalStore.curComponent.style)
  return styleData.filter(style => compStyleKeyMap.includes(style.key))
})

const isShowColorPicker = (str: string) => str.toLowerCase().includes('color')
</script>

<template>
  <div class="v-common-attr">
    <el-collapse v-model="collapseActiveValue" accordion @change="handleChange">
      <el-collapse-item title="通用样式" name="style">
        <el-form>
          <el-form-item v-for="({ key, label }, index) in styleKeys" :key="index" :label="label">
            <el-color-picker v-if="isShowColorPicker(key)" v-model="curComponent!.style[key]" show-alpha />
            <el-select v-else-if="selectKey.includes(key as SelectKey)" v-model="curComponent!.style[key]">
              <el-option
                v-for="item in optionMap[key as SelectKey]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input v-else v-model.number="curComponent!.style[key]" type="number" />
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <Request v-if="curComponent?.request" />
      <Linkage v-if="curComponent?.linkage" />
    </el-collapse>
  </div>
</template>

<style lang="scss">
.v-common-attr {
    .el-input-group__prepend {
        padding: 0 10px;
    }
}
</style>
