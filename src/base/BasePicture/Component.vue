<script setup lang="ts">
import { useEventHandle } from '../common/eventHandle'
import type { ComponentNode, Linkage } from '~/types'

const props = defineProps<{
  propValue: Record<string, any>
  element: ComponentNode
  linkage?: Linkage
}>()
useEventHandle(props.element, props.linkage)

const canvas = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D | null>()
const isFirst = ref(true)
const imgEl = ref<HTMLImageElement>()

const translateImg = () => {
  if (!ctx.value)
    return
  const { vertical, horizontal } = props.propValue.flip
  const { width, height } = props.element.style
  const hValue = horizontal ? -1 : 1
  const vValue = vertical ? -1 : 1

  ctx.value.clearRect(0, 0, width, height)
  // 平移图片
  ctx.value.translate(width / 2 - (width * hValue) / 2, height / 2 - (height * vValue) / 2)
  // scale 参数为负值, 可以实现翻转
  ctx.value.scale(hValue, vValue)
  ctx.value.drawImage(imgEl.value!, 0, 0, width, height)
  // 还原坐标点
  ctx.value.setTransform(1, 0, 0, 1, 0, 0)
}

// 首次渲染图片, 之后translate
const drawImage = () => {
  if (!canvas.value)
    return
  const { width, height } = props.element.style

  canvas.value.width = width
  canvas.value.height = height
  if (isFirst.value) {
    isFirst.value = false
    imgEl.value = document.createElement('img')
    imgEl.value.src = props.propValue.url

    imgEl.value.onload = () => {
      if (!ctx.value)
        return
      ctx.value.drawImage(imgEl.value!, 0, 0, width, height)
      translateImg()
    }
  }
  else {
    translateImg()
  }
}
onMounted(() => {
  if (!canvas.value)
    return
  ctx.value = canvas.value.getContext('2d')
  drawImage()
})
const elementStyle = props.element.style
const flip = (props.element.propValue as Record<string, any>).flip
watch([elementStyle, flip], () => drawImage())
</script>

<template>
  <div style="overflow: hidden">
    <canvas ref="canvas" />
  </div>
</template>

