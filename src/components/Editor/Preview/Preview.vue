<script setup lang="ts">
import { toPng } from 'html-to-image'
import { storeToRefs } from 'pinia'

withDefaults(defineProps<{
  isScreenshot: boolean
}>(), {
  isScreenshot: false,
})
const emit = defineEmits<{ (event: 'close'): void }>() // emit('change')
const handlePreviewClose = () => emit('close')
const globalStore = useGlobalStore()
const { canvasStyleData } = $(storeToRefs(globalStore))
const canvasEl = ref<HTMLElement>()

const htmlToImage = () => {
  if (!canvasEl.value)
    return
  toPng(canvasEl.value).then((dataUrl) => {
    const a = document.createElement('a')
    a.setAttribute('download', 'screenshot')
    a.href = dataUrl
    a.click()
  }).catch((error) => {
    console.error('oops, something went wrong!', error)
  })
    .finally(handlePreviewClose)
}

// 预览时的组件不能影响原组件, 所以得是Base组件的不同实例
const componentData = ref(deepClone(globalStore.componentData))
</script>

<template>
  <Teleport to="body">
    <div class="bg">
      <el-button v-if="!isScreenshot" class="close" @click="handlePreviewClose">
        关闭
      </el-button>
      <div v-else class="close">
        <el-button @click="htmlToImage">
          确定
        </el-button>
        <el-button @click="handlePreviewClose">
          取消
        </el-button>
      </div>

      <div class="canvas-container">
        <div
          ref="canvasEl"
          class="canvas"
          :style="{
            ...getCanvasStyle(canvasStyleData),
            width: `${calcStyleWithScale(canvasStyleData, 'width')}px`,
            height: `${calcStyleWithScale(canvasStyleData, 'height')}px`,
          }"
        >
          <ComponentWrapper
            v-for="(item, index) in componentData"
            :key="index"
            :component-node="item"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.bg {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: fixed;
    background: rgb(0, 0, 0, .5);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 20px;

    .canvas-container {
        width: calc(100% - 40px);
        height: calc(100% - 120px);
        overflow: auto;

        .canvas {
            background: #fff;
            position: relative;
            margin: auto;
        }
    }

    .close {
        position: absolute;
        right: 20px;
        top: 20px;
    }
}
</style>
