import { acceptHMRUpdate, defineStore } from 'pinia'
import type { GlobalState } from './types/global'
import type { ComponentNode, GroupComponentNode } from '~/types'

interface Payload {
  component?: ComponentNode | GroupComponentNode
  index?: number
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({
    componentData: [], // 画布组件数据
    curComponent: undefined,
    curComponentIndex: undefined,
    canvasStyleData: { // 页面全局数据
      width: 1200,
      height: 900,
      scale: 100,
      color: '#000',
      opacity: 1,
      background: '#fff',
      border: '1px solid',
      fontSize: 14,
    },
    isClickComponent: false, // 是否有组件为选中状态
    isInEditor: false,
    editMode: 'edit',
  }),
  actions: {
    setCanvasStyle(style: GlobalState['canvasStyleData']) {
      this.canvasStyleData = style
    },
    setCurComponent({ component, index }: Payload) {
      this.curComponent = component
      this.curComponentIndex = index
    },
    setInEditorStatus(status: boolean) {
      this.isInEditor = status
    },
    setClickComponentStatus(status: boolean) {
      this.isClickComponent = status
    },
    addComponent({ component, index }: Payload) {
      if (!component)
        return
      if (index !== undefined)
        this.componentData.splice(index, 0, component)
      else
        this.componentData.push(component)
    },
    deleteComponent(index?: number) {
      // 删除curComponent
      if (index === undefined)
        index = this.curComponentIndex

      this.curComponentIndex = undefined
      this.curComponent = undefined

      this.componentData.splice(index as number, 1)
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useGlobalStore, import.meta.hot))
