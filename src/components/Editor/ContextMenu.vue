<script setup lang="ts">
import { storeToRefs } from 'pinia'

const globalStore = useGlobalStore()
const { curComponent } = $(storeToRefs(globalStore))
const contextMenuStore = useContextMenuStore()
const { menuShow, menuCoordinate } = $(storeToRefs(contextMenuStore))

const handleMouseUp = () => {
  globalStore.setClickComponentStatus(true)
}

const copy = () => contextMenuStore.copy()
const paste = () => contextMenuStore.paste()
const deleteComponent = () => globalStore.deleteComponent()
const cut = () => contextMenuStore.cut()
const topComponent = () => contextMenuStore.moveToTop()
const bottomComponent = () => contextMenuStore.moveToBottom()
const upComponent = () => contextMenuStore.moveUp()
const downComponent = () => contextMenuStore.moveDown()
const lock = () => contextMenuStore.lock()
const unlock = () => contextMenuStore.unlock()
</script>

<template>
  <div v-show="menuShow" class="contextMenu" :style="{ top: `${menuCoordinate.top}px`, left: `${menuCoordinate.left}px` }">
    <ul @mouseup="handleMouseUp">
      <template v-if="curComponent">
        <template v-if="!curComponent.isLock">
          <li @click="copy">
            复制
          </li>
          <li @click="paste">
            粘贴
          </li>
          <li @click="cut">
            剪切
          </li>
          <li @click="deleteComponent">
            删除
          </li>
          <li @click="lock">
            锁定
          </li>
          <li @click="topComponent">
            置顶
          </li>
          <li @click="bottomComponent">
            置底
          </li>
          <li @click="upComponent">
            上移
          </li>
          <li @click="downComponent">
            下移
          </li>
        </template>
        <li v-else @click="unlock">
          解锁
        </li>
      </template>
      <li v-else @click="paste">
        粘贴
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.contextMenu {
    position: absolute;
    z-index: 1000;

    ul {
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        box-sizing: border-box;
        margin: 5px 0;
        padding: 6px 0;

        li {
            font-size: 14px;
            padding: 0 20px;
            position: relative;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #606266;
            height: 34px;
            line-height: 34px;
            box-sizing: border-box;
            cursor: pointer;

            &:hover {
                background-color: #f5f7fa;
            }
        }
    }
}
</style>
