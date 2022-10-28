<script setup lang="ts">
import { StorageSerializers } from '@vueuse/core'

const router = useRoute()

const id = router.params.id
const componentData = useStorage(`cache_componentData_${id}`, null, undefined, { serializer: StorageSerializers.object })
const canvasStyleData = useStorage(`cache_canvasStyle_${id}`, null, undefined, { serializer: StorageSerializers.object })
</script>

<template>
  <div class="canvas-container">
    <div
      class="canvas"
      :style="{
        ...getCanvasStyle(canvasStyleData),
      }"
    >
      <ComponentWrapper
        v-for="(item, index) in componentData"
        :key="index"
        :component-node="item"
      />
    </div>
  </div>
</template>
