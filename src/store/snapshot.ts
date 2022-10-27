import { acceptHMRUpdate, defineStore } from 'pinia'
import type { SnapshotState } from './types/snapshot'

export const useSnapshotStore = defineStore('snapshot', {
  state: (): SnapshotState => ({
    snapshotData: [], // componentData 快照数据
    snapshotIndex: -1, // 快照数量
  }),
  actions: {
    undo() {
      if (this.snapshotIndex >= 0)
        this.snapshotIndex -= 1

      const globalStore = useGlobalStore()
      const componentData: SnapshotState['snapshotData'] = deepClone(this.snapshotData[this.snapshotIndex]) || []
      if (globalStore.curComponent) {
        const isClean = componentData.find(component => globalStore.curComponent!.id === component.id)

        if (!isClean)
          globalStore.setCurComponent({ component: undefined, index: undefined })
      }

      globalStore.$patch((state) => {
        state.componentData = componentData
      })
    },
    revoke() {
      const globalStore = useGlobalStore()

      if (this.snapshotIndex < this.snapshotData.length - 1) {
        this.snapshotIndex += 1
        globalStore.$patch((state) => {
          state.componentData = deepClone(this.snapshotData[this.snapshotIndex])
        })
      }
    },
    recordSnapshot() {
      const globalStore = useGlobalStore()
      // 一定要从1开始?
      this.snapshotIndex += 1
      this.snapshotData[this.snapshotIndex] = deepClone(globalStore.componentData)

      if (this.snapshotIndex < this.snapshotData.length - 1)
        this.snapshotData = this.snapshotData.slice(0, this.snapshotIndex + 1)
    },
  },
})

/*
撤销: undo上一步操作, 任意操作(添加删除组件, 设置组件属性等)
重做: revoke回退上一步撤销
记录: record 每一步的componentData

undo
  1. 快照数量-1,
  2. 深拷贝当前撤销的快照数据
  3. 给全局的componentData设置

revoke
  只有当快照数量< = 快照长度的时候才能重做
  1. 快照数量+1
  2. 给全局的componentData设置

recordSnapshot
  添加新快照
    在撤销过程中, 如果有添加新的快照,
      将 撤销前的都删掉(相当于重置了快照的起始状态)
      使快照从撤销为新起点重新开始

*/

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useGlobalStore, import.meta.hot))
