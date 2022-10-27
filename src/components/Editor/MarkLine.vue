<script setup lang="ts">
import type { ComponentInternalInstance } from 'vue'

type Lines = ['xt', 'xc', 'xb', 'yl', 'yc', 'yr'][number]
interface ConditionItem {
  isNearly: boolean
  lineNode: HTMLElement
  line: Lines
  dragShift: any
  lineShift: any
}
type ConditionKey = 'top' | 'left'
type Condition = {
  [key in ConditionKey]: ConditionItem[];
}
const lineStatus = ref<Record<Lines, boolean>>({
  xt: false,
  xc: false,
  xb: false,
  yl: false,
  yc: false,
  yr: false,
})
const lines: Array<Lines> = ['xt', 'xc', 'xb', 'yl', 'yc', 'yr'] // 分别对应三条横线和三条竖线
const diff = 10
const globalStore = useGlobalStore()
const curInstance = ref<ComponentInternalInstance>()

const isNearly = (dragValue: number, targetValue: number) => {
  return Math.abs(dragValue - targetValue) <= diff
}
const chooseTheTrueLine = (needToShow: Lines[], isDownward: boolean, isRightward: boolean) => {
  // 如果鼠标向右移动 则按从右到左的顺序显示竖线 否则按相反顺序显示
  // 如果鼠标向下移动 则按从下到上的顺序显示横线 否则按相反顺序显示
  if (isRightward) {
    if (needToShow.includes('yr'))
      lineStatus.value.yr = true
    else if (needToShow.includes('yc'))
      lineStatus.value.yc = true
    else if (needToShow.includes('yl'))
      lineStatus.value.yl = true
  }
  else {
    if (needToShow.includes('yl'))
      lineStatus.value.yl = true
    else if (needToShow.includes('yc'))
      lineStatus.value.yc = true
    else if (needToShow.includes('yr'))
      lineStatus.value.yr = true
  }
  if (isDownward) {
    if (needToShow.includes('xb'))
      lineStatus.value.xb = true
    else if (needToShow.includes('xc'))
      lineStatus.value.xc = true
    else if (needToShow.includes('xt'))
      lineStatus.value.xt = true
  }
  else {
    if (needToShow.includes('xt'))
      lineStatus.value.xt = true
    else if (needToShow.includes('xc'))
      lineStatus.value.xc = true
    else if (needToShow.includes('xb'))
      lineStatus.value.xb = true
  }
}

const hideLine = () => {
  Object.keys(lineStatus.value).forEach((line) => {
    lineStatus.value[line as Lines] = false
  })
}
const calcShift = (key: ConditionKey, condition: ConditionItem, curComponentStyle: Record<string, any>) => {
  const { width, height } = globalStore.curComponent!.style
  if (key === 'top')
    return Math.round(condition.dragShift - (height - curComponentStyle.height) / 2)
  else
    return Math.round(condition.dragShift - (width - curComponentStyle.width) / 2)
}

/*
1. 移动组件时, 根据鼠标start,和鼠标cur判断移动方向
2. 遍历componentData, 建立top和left对应的5种判断条件Map
3. 遍历map, 计算出两者位置是否<diff, 则进行相应偏移, 同时设置线条
4. 根据鼠标移动方向, 判断需要显示的哪些线条
*/
const showLine = (isDownward: boolean, isRightward: boolean) => {
  if (!globalStore.curComponent)
    return

  // Record<Lines, Array<HTMLElement>>
  const lineEl: Record<Lines, Array<HTMLElement>> = curInstance.value?.proxy?.$refs as Record<Lines, Array<HTMLElement>>
  const curComponent = globalStore.curComponent
  const curComponentStyle = getComponentRotatedStyle(curComponent.style)
  const curComponentHalfWidth = curComponentStyle.width / 2
  const curComponentHalfHeight = curComponentStyle.height / 2

  hideLine()
  globalStore.componentData.forEach((component) => {
    if (component === curComponent)
      return
    const componentStyle = getComponentRotatedStyle(component.style)
    const { top, left, bottom, right } = componentStyle
    const componentHalfWidth = componentStyle.width / 2
    const componentHalfHeight = componentStyle.height / 2

    /* top 有三种,
      1. cur.top与component.top
      2. cur.bottom与component.top
      3. cur.top与component.bottom
      4. cur.bottom与cur.top
      5. cur.top + half 与 component.top+half (比较中线是否对其)
      left同理
    */
    const conditions: Condition = {
      top: [
        {
          isNearly: isNearly(curComponentStyle.top, top),
          lineNode: lineEl.xt[0], // xt
          line: 'xt',
          dragShift: top,
          lineShift: top,
        },
        {
          isNearly: isNearly(curComponentStyle.bottom, top),
          lineNode: lineEl.xt[0], // xt
          line: 'xt',
          dragShift: top - curComponentStyle.height,
          lineShift: top,
        },
        {
          // 组件与拖拽节点的中间是否对齐
          isNearly: isNearly(curComponentStyle.top + curComponentHalfHeight, top + componentHalfHeight),
          lineNode: lineEl.xc[0], // xc
          line: 'xc',
          dragShift: top + componentHalfHeight - curComponentHalfHeight,
          lineShift: top + componentHalfHeight,
        },
        {
          isNearly: isNearly(curComponentStyle.top, bottom),
          lineNode: lineEl.xb[0], // xb
          line: 'xb',
          dragShift: bottom,
          lineShift: bottom,
        },
        {
          isNearly: isNearly(curComponentStyle.bottom, bottom),
          lineNode: lineEl.xb[0], // xb
          line: 'xb',
          dragShift: bottom - curComponentStyle.height,
          lineShift: bottom,
        },
      ],
      left: [
        {
          isNearly: isNearly(curComponentStyle.left, left),
          lineNode: lineEl.yl[0], // yl
          line: 'yl',
          dragShift: left,
          lineShift: left,
        },
        {
          isNearly: isNearly(curComponentStyle.right, left),
          lineNode: lineEl.yl[0], // yl
          line: 'yl',
          dragShift: left - curComponentStyle.width,
          lineShift: left,
        },
        {
          // 组件与拖拽节点的中间是否对齐
          isNearly: isNearly(curComponentStyle.left + curComponentHalfWidth, left + componentHalfWidth),
          lineNode: lineEl.yc[0], // yc
          line: 'yc',
          dragShift: left + componentHalfWidth - curComponentHalfWidth,
          lineShift: left + componentHalfWidth,
        },
        {
          isNearly: isNearly(curComponentStyle.left, right),
          lineNode: lineEl.yr[0], // yr
          line: 'yr',
          dragShift: right,
          lineShift: right,
        },
        {
          isNearly: isNearly(curComponentStyle.right, right),
          lineNode: lineEl.yr[0], // yr
          line: 'yr',
          dragShift: right - curComponentStyle.width,
          lineShift: right,
        },
      ],
    }

    const needToShow: Lines[] = []
    const { rotate } = curComponent.style

    // 不知道怎么修改forEach key的类型, 暂时这样写
    Object.keys(conditions).forEach((key) => {
      conditions[key as ConditionKey].forEach((condition) => {
        if (!condition.isNearly)
          return

        globalStore.$patch((state) => {
          state.curComponent!.style[key] = rotate !== 0 ? calcShift(key as ConditionKey, condition, curComponentStyle) : condition.dragShift
        })
        condition.lineNode.style[key as ConditionKey] = `${condition.lineShift}px`
        needToShow.push(condition.line)
      })
    })

    if (needToShow.length)
      chooseTheTrueLine(needToShow, isDownward, isRightward)
  })
}

onMounted(() => {
  curInstance.value = getCurrentInstance()!
  const moveEventBus = useEventBus<{ isDownward: boolean; isRightward: boolean }>('move')
  moveEventBus.on(({ isDownward, isRightward }) => showLine(isDownward, isRightward))

  const unMoveEventBus = useEventBus('unmove')
  unMoveEventBus.on(() => hideLine())
})
</script>

<template>
  <div class="mark-line">
    <div
      v-for="line in lines"
      v-show="lineStatus[line] || false"
      :key="line"
      :ref="line"
      class="line"
      :class="line.includes('x') ? 'xLine' : 'yLine'"
    />
  </div>
</template>

<style lang="scss" scoped>
.mark-line {
    height: 100%;
}

.line {
    background: #59c7f9;
    position: absolute;
    z-index: 1000;
}

.xLine {
    width: 100%;
    height: 1px;
}

.yLine {
    width: 1px;
    height: 100%;
}
</style>
