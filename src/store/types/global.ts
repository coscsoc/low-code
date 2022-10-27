import type { ComponentNode, GroupComponentNode } from '~/types'

export interface GlobalState {
  componentData: Array<ComponentNode | GroupComponentNode> // 画布组件数据
  curComponent?: ComponentNode | GroupComponentNode
  curComponentIndex?: number
  canvasStyleData: Record<string, number | string>
  isClickComponent: boolean
  isInEditor: boolean
  editMode: 'edit' | 'preview'
}
