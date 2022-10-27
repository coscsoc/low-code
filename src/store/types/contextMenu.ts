import type { ComponentNode, GroupComponentNode } from '~/types'

export interface ContextMenuState {
  menuCoordinate: { top: number; left: number }
  menuShow: boolean
  copyData: {
    data?: ComponentNode | GroupComponentNode
    index?: number
  }
  isCut: boolean
}
