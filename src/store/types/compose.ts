import type { ComponentNode, GroupComponentNode } from '~/types'
export interface ComposeState {
  editor?: HTMLElement
  areaStatus: {
    style: {
      x: number
      y: number
      width: number
      height: number
    }
    isShow: boolean
    components: Array<ComponentNode | GroupComponentNode>
  }
}
