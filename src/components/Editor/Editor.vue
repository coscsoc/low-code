<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ComponentNode, GroupComponentNode } from '~/types/index'
// import { ContextMenu } from '~/components/Editor/ContextMenu'

const svgFilterAttrs = ['width', 'height', 'top', 'left', 'rotate']

const editorEl = ref<HTMLElement>()
const globalStore = useGlobalStore()
const { componentData, curComponent, canvasStyleData } = $(storeToRefs(globalStore))
const composeStore = useComposeStore()
const { areaStatus } = $(storeToRefs(composeStore))
const editorCoordinate = $(ref({ x: 0, y: 0 }))
const contextMenuStore = useContextMenuStore()

nextTick(() => {
  if (editorEl.value !== undefined)
    composeStore.setEditor(editorEl.value)
})

const getComponentStyle = (style: ComponentNode['style']) => {
  return getStyle(style, svgFilterAttrs)
}

const handleContextMenu = (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()

  // 计算菜单相对于编辑器的位移
  let target = e.target as HTMLElement | SVGAElement
  const menuCoordinate = { top: e.offsetY, left: e.offsetX }

  while (target instanceof SVGElement)
    target && (target = target.parentNode as HTMLElement)

  while (!target.className.includes('editor')) {
    menuCoordinate.left += target.offsetLeft
    menuCoordinate.top += target.offsetTop
    if (target.parentElement)
      target = target.parentElement
  }

  contextMenuStore.showContextMenu(menuCoordinate)
}

const hideArea = () => composeStore.resetAreaStatus()
const getSelectArea = () => {
  const result: Array<ComponentNode | GroupComponentNode> = []
  const areaStyle = composeStore.areaStatus.style
  componentData.forEach((component) => {
    if (component.isLock)
      return
    const { left, top, width, height } = getComponentRotatedStyle(component.style)
    if (areaStyle.x <= left && areaStyle.y <= top && (left + width <= areaStyle.x + areaStyle.width) && (top + height <= areaStyle.y + areaStyle.height))
      result.push(component)
  })

  return result
}
const createGroup = () => {
  const areaComponents = getSelectArea()
  if (areaComponents.length <= 1)
    return hideArea()

  let minLeft = Infinity
  let minTop = Infinity
  let maxRight = -Infinity
  let maxBottom = -Infinity
  // 可以抽出来 用递归写
  areaComponents.forEach((component) => {
    interface Style { left: number; top: number; right: number; bottom: number }
    let style: Style = { left: 0, top: 0, right: 0, bottom: 0 }
    const querySelector = (id: string) => document.querySelector(id)
    // 如果是Group组件类型
    if (component.component === 'BaseGroup') {
      // Group组件 的 子组件
      (component as GroupComponentNode).propValue.forEach((item) => {
        const itemInfo = (querySelector(`#component${item.id}`)!).getBoundingClientRect()

        style.left = itemInfo.left - editorCoordinate.x
        style.top = itemInfo.top - editorCoordinate.y
        style.right = itemInfo.right - editorCoordinate.x
        style.bottom = itemInfo.bottom - editorCoordinate.y

        // 找出所有组件的边界值
        minLeft = Math.min(minLeft, style.left)
        minTop = Math.min(minTop, style.top)
        maxRight = Math.max(maxRight, style.right)
        maxBottom = Math.max(maxBottom, style.bottom)
      })
    }
    else {
      style = getComponentRotatedStyle(component.style) as Style
    }

    minLeft = Math.min(minLeft, style.left)
    minTop = Math.min(minTop, style.top)
    maxRight = Math.max(maxRight, style.right)
    maxBottom = Math.max(maxBottom, style.bottom)
  })

  composeStore.$patch(({ areaStatus }) => {
    areaStatus.style.x = minLeft
    areaStatus.style.y = minTop
    areaStatus.style.width = maxRight - minLeft
    areaStatus.style.height = maxBottom - minTop
    areaStatus.components = areaComponents
  })
}

const handleMouseDown = (e: MouseEvent) => {
  if (!curComponent)
    e.preventDefault()

  hideArea()

  if (!editorEl.value)
    return
  const editorRectInfo = editorEl.value.getBoundingClientRect()
  const mouseStart = { x: e.clientX, y: e.clientY }

  editorCoordinate.x = editorRectInfo.x
  editorCoordinate.y = editorRectInfo.y

  composeStore.$patch(({ areaStatus }) => {
    areaStatus.style.x = mouseStart.x - editorCoordinate.x
    areaStatus.style.y = mouseStart.y - editorCoordinate.y
    areaStatus.isShow = true
  })

  const move = (event: MouseEvent) => {
    composeStore.$patch(({ areaStatus }) => {
      areaStatus.style.width = Math.abs(event.clientX - mouseStart.x)
      areaStatus.style.height = Math.abs(event.clientY - mouseStart.y)

      if (event.clientX < mouseStart.x)
        areaStatus.style.x = event.clientX - editorCoordinate.x
      if (event.clientY < mouseStart.y)
        areaStatus.style.y = event.clientY - editorCoordinate.y
    })
  }

  const cleanMove = useEventListener(document, 'mousemove', move)
  const cleanup = useEventListener(document, 'mouseup', up)
  // 需要变量提升
  function up(e: MouseEvent) {
    cleanMove()
    cleanup()

    if (e.clientX === areaStatus.style.x && e.clientY === areaStatus.style.y)
      return hideArea()

    createGroup()
  }
}

onMounted(() => {
  const hideAreaEventBus = useEventBus('hide-area')
  hideAreaEventBus.on(() => hideArea())
})
</script>

<template>
  <div
    id="editor" ref="editorEl"
    class="editor edit"
    :style="{
      ...getCanvasStyle(canvasStyleData),
      width: `${calcStyleWithScale(canvasStyleData, 'width')}px`,
      height: `${calcStyleWithScale(canvasStyleData, 'height')}px`,
    }"
    @contextmenu="handleContextMenu"
    @mousedown="handleMouseDown"
  >
    <Shape
      v-for="(item, index) in componentData"
      :key="item.id"
      :default-style="item.style"
      :style="getShapeStyle(item.style)"
      :active="item.id === curComponent?.id"
      :element="item"
      :index="index"
      :class="{ lock: item.isLock }"
    >
      <component
        :is="item.component"
        v-if="item.component !== 'BaseText'"
        :id="`component${item.id}`"
        class="component"
        :style="getComponentStyle(item.style)"
        :prop-value="item.propValue"
        :element="item"
        :request="item.request"
      />
      <component
        :is="item.component"
        v-else
        :id="`component${item.id}`"
        class="component"
        :style="getComponentStyle(item.style)"
        :prop-value="item.propValue"
        :element="item"
        :request="item.request"
      />
    </Shape>
    <ContextMenu />
    <MarkLine />
    <Area />
  </div>
</template>

<style lang="scss" scoped>
.editor {
    position: relative;
    background: #fff;
    margin: auto;

    .lock {
        opacity: .5;

        &:hover {
            cursor: not-allowed;
        }
    }
}

.edit {
    .component {
        outline: none;
        width: 100%;
        height: 100%;
    }
}
</style>
