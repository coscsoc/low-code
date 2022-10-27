<script setup lang="ts">
import { storeToRefs } from 'pinia'
import runAnimation from '../ControlPanel/runAnimation'
import type { ComponentNode, GroupComponentNode } from '~/types'

const props = withDefaults(defineProps<{
  index: number
  defaultStyle: ComponentNode['style']
  element: ComponentNode | GroupComponentNode
  active: boolean
}>(), {
  active: false,
  index: 0,
})

const shapeEl = ref<HTMLElement>()
const isActive = computed(() => props.active && !props.element.isLock)
// 每个点对应的初始角度
const initialAngle = {
  lt: 0,
  t: 45,
  rt: 90,
  r: 135,
  rb: 180,
  b: 225,
  lb: 270,
  l: 315,
}
const angleToCursor = [ // 每个范围的角度对应的光标
  { start: 338, end: 23, cursor: 'nw' },
  { start: 23, end: 68, cursor: 'n' },
  { start: 68, end: 113, cursor: 'ne' },
  { start: 113, end: 158, cursor: 'e' },
  { start: 158, end: 203, cursor: 'se' },
  { start: 203, end: 248, cursor: 's' },
  { start: 248, end: 293, cursor: 'sw' },
  { start: 293, end: 338, cursor: 'w' },
]
type InitialAngle = keyof typeof initialAngle
const pointList: InitialAngle[] = ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l']
const pointList2: InitialAngle[] = ['r', 'l']
const cursors = ref<Record<InitialAngle, string>>({ lt: '', t: '', rt: '', r: '', rb: '', b: '', lb: '', l: '' })

const globalStore = useGlobalStore()
const snapshotStore = useSnapshotStore()
const { curComponent } = storeToRefs(globalStore)
const contextMenuStore = useContextMenuStore()
const composeStore = useComposeStore()

const getCursor = () => {
  if (!curComponent || !curComponent.value)
    return
  const rotate = mod360(curComponent.value.style.rotate)
  let lastMatchIndex = -1 // 从上一个命中的角度的索引开始匹配下一个，降低时间复杂度

  pointList.forEach((point) => {
    const angle = mod360(initialAngle[point] + rotate)
    const len = angleToCursor.length

    while (true) {
      lastMatchIndex = (lastMatchIndex + 1) % len
      const angleLimit = angleToCursor[lastMatchIndex]
      if (angle < 23 || angle >= 338) {
        cursors.value[point] = 'nw-resize'
        return
      }

      if (angleLimit.start <= angle && angle < angleLimit.end) {
        cursors.value[point] = `${angleLimit.cursor}-resize`
        return
      }
    }
  })
}
const handleMouseDownOnShape = (e: MouseEvent) => {
  globalStore.setInEditorStatus(true)
  globalStore.setClickComponentStatus(true)
  e.stopPropagation()

  globalStore.setCurComponent({ component: props.element, index: props.index })
  if (props.element.isLock)
    return

  getCursor()
  const mouseStart = { x: e.clientX, y: e.clientY }
  const elementStyle = { ...props.element.style }
  const elementStart = { x: elementStyle.left, y: elementStyle.top }

  let hasMove = false
  const move = (event: MouseEvent) => {
    hasMove = true
    const curMouse = { x: event.clientX, y: event.clientY }
    elementStyle.top = event.clientY - mouseStart.y + elementStart.y
    elementStyle.left = event.clientX - mouseStart.x + elementStart.x

    globalStore.$patch(({ curComponent }) => {
      if (curComponent) {
        curComponent.style.top = Math.round(elementStyle.top)
        curComponent.style.left = Math.round(elementStyle.left)
        curComponent.style.width = Math.round(elementStyle.width)
        curComponent.style.height = Math.round(elementStyle.height)
        curComponent.style.rotate = Math.round(elementStyle.rotate)
      }
    })

    nextTick(() => {
      const moveEventBus = useEventBus<{ isDownward: boolean;isRightward: boolean }>('move')
      moveEventBus.emit({
        isDownward: curMouse.y - mouseStart.y > 0,
        isRightward: curMouse.x - mouseStart.x > 0,
      })
    })
  }
  const up = () => {
    hasMove && snapshotStore.recordSnapshot()
    // 触发元素停止移动事件，用于隐藏标线
    //  eventBus.$emit('unmove')
    const unMoveEventBus = useEventBus('unmove')
    unMoveEventBus.emit()
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}
// 先触发mousedown/move/up, 再触发click
const selectCurComponent = (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  contextMenuStore.hideContextMenu()
}
const getPointList = () => {
  return props.element.component === 'BaseLineShape' ? pointList2 : pointList
}
const getPointStyle = (point: InitialAngle) => {
  const { width, height } = props.defaultStyle
  const hasT = /t/.test(point)
  const hasB = /b/.test(point)
  const hasL = /l/.test(point)
  const hasR = /r/.test(point)
  let newLeft = 0
  let newTop = 0

  // 四个角的点
  if (point.length === 2) {
    newLeft = hasL ? 0 : width
    newTop = hasT ? 0 : height
  }
  else {
    // 上下两点的点，宽度居中
    if (hasT || hasB) {
      newLeft = width / 2
      newTop = hasT ? 0 : height
    }

    // 左右两边的点，高度居中
    if (hasL || hasR) {
      newLeft = hasL ? 0 : width
      newTop = Math.floor(height / 2)
    }
  }

  const style = {
    marginLeft: '-4px',
    marginTop: '-4px',
    left: `${newLeft}px`,
    top: `${newTop}px`,
    cursor: cursors.value[point],
  }

  return style
}

const handleRotate = (e: MouseEvent) => {
  globalStore.setClickComponentStatus(true)
  e.stopPropagation()
  e.preventDefault()

  const elementStyle = props.defaultStyle
  const startRotate = elementStyle.rotate
  // 获取元素中心点位置
  const rect = shapeEl.value!.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  // 旋转前的角度
  const rotateDegreeBefore = Math.atan2(e.clientY - centerY, e.clientX - centerX) / (Math.PI / 180)
  // 如果元素没有移动，则不保存快照
  let hasMove = false
  const move = (e: MouseEvent) => {
    hasMove = true
    // 旋转后的角度
    const rotateDegreeAfter = Math.atan2(e.clientY - centerY, e.clientX - centerX) / (Math.PI / 180)
    // 获取旋转的角度值
    elementStyle.rotate = startRotate + rotateDegreeAfter - rotateDegreeBefore
  }

  const up = () => {
    hasMove && snapshotStore.recordSnapshot()
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
    getCursor()
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}
const isNeedLockProportion = () => {
  if (props.element.component !== 'Group')
    return false
  const rotates = [0, 90, 180, 360]
  for (const component of (props.element as GroupComponentNode).propValue) {
    if (!rotates.includes(mod360(parseInt(component.style.rotate))))
      return true
  }

  return false
}
const handleMouseDownOnPoint = (point: InitialAngle, e: MouseEvent) => {
  globalStore.setInEditorStatus(true)
  globalStore.setClickComponentStatus(true)
  e.stopPropagation()
  e.preventDefault()

  const ElementStyle = props.defaultStyle
  // 组件宽高比
  const proportion = ElementStyle.width / ElementStyle.height
  // 组件中心点
  const center = {
    x: ElementStyle.left + ElementStyle.width / 2,
    y: ElementStyle.top + ElementStyle.height / 2,
  }

  // 获取画布位移信息
  const editorRectInfo = composeStore.editor!.getBoundingClientRect()
  const mouseTarget = e.target as HTMLElement
  const pointRect = mouseTarget.getBoundingClientRect()
  // 当前点击圆点相对于画布的中心坐标
  const curPoint = {
    x: Math.round(pointRect.left - editorRectInfo.left + mouseTarget.offsetWidth / 2),
    y: Math.round(pointRect.top - editorRectInfo.top + mouseTarget.offsetHeight / 2),
  }
  // 获取对称点的坐标
  const symmetricPoint = {
    x: center.x - (curPoint.x - center.x),
    y: center.y - (curPoint.y - center.y),
  }

  // 是否需要保存快照
  let needSave = false
  let isFirst = true

  const needLockProportion = isNeedLockProportion()
  const move = (e: MouseEvent) => {
    // 第一次点击时也会触发 move，所以会有“刚点击组件但未移动，组件的大小却改变了”的情况发生
    // 因此第一次点击时不触发 move 事件
    if (isFirst) {
      isFirst = false
      return
    }

    needSave = true
    const curPosition = {
      x: e.clientX - Math.round(editorRectInfo.left),
      y: e.clientY - Math.round(editorRectInfo.top),
    }

    calculateComponentPositionAndSize(point, ElementStyle, curPosition, proportion, needLockProportion, {
      center,
      curPoint,
      symmetricPoint,
    })
  }

  const up = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)

    needSave && snapshotStore.recordSnapshot()
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

onMounted(() => {
  const runAnimationEventBus = useEventBus('runAnimation')
  runAnimationEventBus.on(() => {
    if (props.element === globalStore?.curComponent)
      runAnimation(shapeEl.value!, globalStore.curComponent.animations)
  })
  const stopAnimationEventBus = useEventBus('stopAnimation')
  stopAnimationEventBus.on(() => {
    shapeEl.value!.classList.remove('animated', 'infinite')
  })
})
</script>

<template>
  <div
    ref="shapeEl"
    class="shape"
    :class="{ active }"
    @click="selectCurComponent"
    @mousedown="handleMouseDownOnShape"
  >
    <span v-show="isActive" class="iconfont icon-xiangyouxuanzhuan" @mousedown="handleRotate" />
    <span v-show="element.isLock" class="iconfont icon-suo" />
    <div
      v-for="item in (isActive ? getPointList() : [])"
      :key="item"
      class="shape-point"
      :style="getPointStyle(item)"
      @mousedown="handleMouseDownOnPoint(item, $event)"
    />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.shape {
    position: absolute;

    &:hover {
        cursor: move;
    }
}

.active {
    outline: 1px solid #70c0ff;
    user-select: none;
}

.shape-point {
    position: absolute;
    background: #fff;
    border: 1px solid #59c7f9;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    z-index: 1;
}

.icon-xiangyouxuanzhuan {
    position: absolute;
    top: -34px;
    left: 50%;
    transform: translateX(-50%);
    cursor: grab;
    color: #59c7f9;
    font-size: 20px;
    font-weight: 600;

    &:active {
        cursor: grabbing;
    }
}

.icon-suo {
    position: absolute;
    top: 0;
    right: 0;
}
</style>
