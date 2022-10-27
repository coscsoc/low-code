<script setup lang="ts">
import { storeToRefs } from 'pinia'

const newsEventBus = useEventBus<string>('news')
const globalStore = useGlobalStore()
const snapshotStore = useSnapshotStore()
const { componentData, curComponentIndex } = $(storeToRefs(globalStore))
const calcIndex = (index: number) => componentData.length - 1 - index

const contextMenuStore = useContextMenuStore()
const upComponent = () => {
  newsEventBus.once(contextMenuStore.moveUp)
  snapshotStore.recordSnapshot()
}
const downComponent = () => {
  newsEventBus.once(contextMenuStore.moveDown)
  snapshotStore.recordSnapshot()
}
const deleteComponent = (index: number) => {
  index = calcIndex(index)
  newsEventBus.once(() => globalStore.deleteComponent(index))
  snapshotStore.recordSnapshot()
}
const setCurComponent = (index: number) => {
  index = calcIndex(index)
  globalStore.setCurComponent({ component: componentData[index], index })
  newsEventBus.emit()
}
const getComponent = (index: number) => {
  index = calcIndex(index)
  return componentData[index]
}

// 因为事件冒泡, 会先触发delete再触发setCur
// 需要改变事件顺序, 先触发setCur用useEventBus
</script>

<template>
  <div class="realtime-component-list">
    <div
      v-for="(_, index) in componentData" :key="index"
      class="list"
      :class="{ actived: calcIndex(index) === curComponentIndex }"
      @click="setCurComponent(index)"
    >
      <span class="iconfont" :class="`icon-${getComponent(index).icon}`" />
      <span>{{ getComponent(index).label }}</span>
      <div class="icon-container">
        <span class="iconfont icon-shangyi" @click="upComponent()" />
        <span class="iconfont icon-xiayi" @click="downComponent()" />
        <span class="iconfont icon-shanchu" @click="deleteComponent(index)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.realtime-component-list {
    height: 35%;

    .list {
        height: 30px;
        cursor: grab;
        text-align: center;
        color: #333;
        display: flex;
        align-items: center;
        font-size: 12px;
        padding: 0 10px;
        position: relative;
        user-select: none;

        &:active {
            cursor: grabbing;
        }

        &:hover {
            background-color: rgba(200, 200, 200, .2);

            .icon-container {
                display: block;
            }
        }

        .iconfont {
            margin-right: 4px;
            font-size: 16px;
        }

        .icon-wenben,
        .icon-tupian {
            font-size: 14px;
        }

        .icon-container {
            position: absolute;
            right: 10px;
            display: none;

            .iconfont {
                cursor: pointer;
            }
        }
    }

    .actived {
        background: #ecf5ff;
        color: #409eff;
    }
}
</style>
