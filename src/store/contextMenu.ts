import { acceptHMRUpdate, defineStore, storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import type { ContextMenuState } from './types/contextMenu'
import { useGlobalStore } from './global'

export const useContextMenuStore = defineStore('contextMenu', {
  state: (): ContextMenuState => ({
    menuCoordinate: { top: 0, left: 0 },
    menuShow: false,
    copyData: {},
    isCut: false,
  }),
  actions: {
    showContextMenu(menu: ContextMenuState['menuCoordinate']) {
      this.menuShow = true
      this.menuCoordinate = menu
    },
    hideContextMenu() {
      this.menuShow = false
    },
    lock() {
      const globalStore = useGlobalStore()
      if (globalStore.curComponent)
        globalStore.curComponent.isLock = true
    },
    unlock() {
      const globalStore = useGlobalStore()
      if (globalStore.curComponent)
        globalStore.curComponent.isLock = false
    },
    copy() {
      const globalStore = useGlobalStore()

      if (!globalStore.curComponent)
        return ElMessage({ type: 'warning', message: '请先选择组件' })
      this.resetPreCutData()

      this.copyData = {
        data: deepClone(globalStore.curComponent),
        index: globalStore.curComponentIndex,
      }

      this.isCut = false
    },
    paste(isMouse = true) {
      const globalStore = useGlobalStore()

      if (!this.copyData.data)
        return ElMessage({ type: 'warning', message: '请先复制组件' })
      const copyData = deepClone(this.copyData.data)
      if (isMouse)
        Object.assign(copyData.style, { ...this.menuCoordinate })

      // 生成新的id
      copyData.id = generateID()
      globalStore.addComponent({ component: copyData, index: this.copyData.index })

      // 剪切只能粘贴一次
      if (this.isCut)
        this.copyData = {}
    },
    cut() {
      const globalStore = useGlobalStore()
      if (!globalStore.curComponent)
        return ElMessage({ type: 'warning', message: '请先选择组件' })

      this.resetPreCutData()
      this.copyData = {
        data: deepClone(globalStore.curComponent),
        index: globalStore.curComponentIndex,
      }

      globalStore.deleteComponent()
      this.isCut = true
    },
    // 先剪切, 再复制, 要还原剪切的组件
    // 先缓存剪切的数据preData, 然后添加
    // (即原始的相对位置)
    // 如果curIdx>=preDataIdx, 还原的话, 要将curIdx后移一位, 放入preData
    resetPreCutData() {
      const globalStore = useGlobalStore()
      if (this.isCut && this.copyData.data) {
        const preCopyData = deepClone(this.copyData)
        globalStore.addComponent({ component: preCopyData.data, index: preCopyData.index })
        if (globalStore.curComponentIndex !== undefined && (globalStore.curComponentIndex >= preCopyData.index))
          globalStore.curComponentIndex += 1
      }
    },
    moveUp() {
      const globalStore = useGlobalStore()
      const { curComponentIndex, componentData } = storeToRefs(globalStore)

      const curComIdx = curComponentIndex?.value
      if (curComIdx === undefined)
        return
      if (curComIdx < componentData.value.length - 1)
        swap(componentData.value, curComIdx, (globalStore.curComponentIndex! += 1))
      else
        ElMessage({ type: 'warning', message: '已经到顶了' })
    },
    moveDown() {
      const globalStore = useGlobalStore()
      const { curComponentIndex, componentData } = storeToRefs(globalStore)

      const curComIdx = curComponentIndex?.value
      if (curComIdx === undefined)
        return
      if (curComIdx > 0)
        swap(componentData.value, curComIdx, (globalStore.curComponentIndex! -= 1))
      else
        ElMessage({ type: 'warning', message: '已经到底了' })
    },
    moveToTop() {
      const globalStore = useGlobalStore()
      const { curComponentIndex, componentData, curComponent } = storeToRefs(globalStore)

      const curComIdx = curComponentIndex?.value
      if (curComIdx === undefined)
        return
      if (curComIdx < componentData.value.length - 1) {
        componentData.value.splice(curComIdx, 1)
        componentData.value.push(curComponent!.value!)
        globalStore.curComponentIndex = componentData.value.length - 1
      }
      else {
        ElMessage({ type: 'warning', message: '已经到顶了' })
      }
    },
    moveToBottom() {
      const globalStore = useGlobalStore()
      const { curComponentIndex, componentData, curComponent } = storeToRefs(globalStore)

      const curComIdx = curComponentIndex?.value
      if (curComIdx === undefined)
        return
      if (curComIdx > 0) {
        componentData.value.splice(curComIdx, 1)
        componentData.value.unshift(curComponent!.value!)
        globalStore.curComponentIndex = 0
      }
      else {
        ElMessage({ type: 'warning', message: '已经到底了' })
      }
    },
  },
})

function swap(arr: Array<any>, a: number, b: number) {
  [arr[a], arr[b]] = [arr[b], arr[a]]
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useContextMenuStore, import.meta.hot))
