import { acceptHMRUpdate, defineStore, storeToRefs } from 'pinia'
import type { ComposeState } from './types/compose'
import type { ComponentNode, GroupComponentNode } from '~/types'
import { commonAttr, commonStyle } from '~/base/component-list'

const initialAreaStatus = {
  style: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  isShow: false,
  components: [],
}

export const useComposeStore = defineStore('compose', {
  state: (): ComposeState => ({
    areaStatus: deepClone(initialAreaStatus),
    editor: undefined,
  }),
  actions: {
    setEditor(el: HTMLElement) {
      this.editor = el
    },
    setAreaStatus(areaStatus: ComposeState['areaStatus']) {
      this.areaStatus = areaStatus
    },
    resetAreaStatus() {
      this.areaStatus = deepClone(initialAreaStatus)
    },
    compose() {
      const areaComponents: Array<ComponentNode | GroupComponentNode> = []
      this.areaStatus.components.forEach((component) => {
        if (component.component !== 'BaseGroup') {
          areaComponents.push(component)
        }
        else {
          const parentStyle = { ...component.style }
          const subComponents = (component as GroupComponentNode).propValue
          const editorRect = this.editor!.getBoundingClientRect()

          subComponents.forEach((component) => {
            decomposeComponent(component, editorRect, parentStyle)
          })

          areaComponents.push(...subComponents)
        }
      })

      const groupComponent = {
        id: generateID(),
        component: 'BaseGroup',
        label: '组合',
        icon: 'zuhe',
        ...commonAttr,
        style: {
          left: this.areaStatus.style.x,
          top: this.areaStatus.style.y,
          ...commonStyle,
          ...this.areaStatus.style,
        },
        propValue: areaComponents,
        collapseName: '',
      }
      createGroupStyle(groupComponent)

      const globalStore = useGlobalStore()
      globalStore.addComponent({
        component: groupComponent,
        index: undefined,
      })

      const hideAreaEventBus = useEventBus('hideArea')
      hideAreaEventBus.emit('hideArea')

      this.patchComponent()
      globalStore.setCurComponent({
        component: globalStore.componentData[globalStore.componentData.length - 1],
        index: globalStore.componentData.length - 1,
      })
    },
    decompose() {
      const globalStore = useGlobalStore()
      if (!globalStore.curComponent)
        return
      const parentStyle = { ...globalStore.curComponent.style }
      const components = (globalStore.curComponent as GroupComponentNode).propValue
      const editorRect = this.editor!.getBoundingClientRect()

      globalStore.deleteComponent()
      components.forEach((component) => {
        decomposeComponent(component, editorRect, parentStyle)
        globalStore.addComponent({
          component,
          index: undefined,
        })
      })
    },
    // 将Group的子组件从componentData中删除
    patchComponent() {
      const globalStore = useGlobalStore()
      const { componentData } = $(storeToRefs(globalStore))
      this.areaStatus.components.forEach((component) => {
        for (let i = 0, len = componentData.length; i < len; i++) {
          if (component.id === componentData[i].id) {
            componentData.splice(i, 1)
            break
          }
        }
      })
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useComposeStore, import.meta.hot))
