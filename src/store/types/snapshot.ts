import type { ComponentNode, GroupComponentNode } from '~/types'

export interface SnapshotState {
  snapshotData: Array<ComponentNode | GroupComponentNode>
  snapshotIndex: number
}
