<script setup lang="ts">
import { storeToRefs } from 'pinia'

const composeStore = useComposeStore()
const { areaStatus } = $(storeToRefs(composeStore))
</script>

<template>
  <div
    v-show="areaStatus.isShow"
    class="area"
    :style="{
      left: `${areaStatus.style.x}px`,
      top: `${areaStatus.style.y}px`,
      width: `${areaStatus.style.width}px`,
      height: `${areaStatus.style.height}px`,
    }"
  />
</template>

<style lang="scss" scoped>
.area {
    border: 1px solid #70c0ff;
    position: absolute;
}
</style>
