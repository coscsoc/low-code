import { storeToRefs } from 'pinia'
import './index.scss'

// 不懂为什么hRenderFunction事件绑定无效
export const ContextMenu = defineComponent({
  render() {
    const globalStore = useGlobalStore()
    const snapshotStore = useSnapshotStore()
    const contextMenuStore = useContextMenuStore()
    const { menuShow, menuCoordinate } = $(storeToRefs(contextMenuStore))
    const menuMap = [
      { name: '复制', event: contextMenuStore.copy },
      {
        name: '粘贴',
        event: () => {
          contextMenuStore.paste()
          snapshotStore.recordSnapshot()
        },
      },
      { name: '剪切', event: contextMenuStore.cut },
      {
        name: '删除',
        event: () => {
          globalStore.deleteComponent()
          snapshotStore.recordSnapshot()
        },
      },
      { name: '锁定', event: contextMenuStore.lock },
      { name: '解锁', event: contextMenuStore.unlock },
      {
        name: '上移',
        event: () => {
          contextMenuStore.moveUp()
          snapshotStore.recordSnapshot()
        },
      },
      {
        name: '下移',
        event: () => {
          contextMenuStore.moveDown()
          snapshotStore.recordSnapshot()
        },
      },
      {
        name: '置顶',
        event: () => {
          contextMenuStore.moveToTop()
          snapshotStore.recordSnapshot()
        },
      },
      {
        name: '置底',
        event: () => {
          contextMenuStore.moveToBottom()
          snapshotStore.recordSnapshot()
        },
      },
    ]

    const renderChildren = () => {
      if (globalStore.curComponent) {
        if (globalStore.curComponent.isLock)
          return <li onClick={contextMenuStore.unlock}>解锁</li>
        else
          return menuMap.map(menu => <li onClick={() => menu.event()}>{menu.name}</li>)
      }
      else { return <li onClick={ contextMenuStore.copy }>粘贴</li> }
    }
    return menuShow
      ? (
        <div class="contextmenu" style={{ top: `${menuCoordinate.top}px`, left: `${menuCoordinate.left}px` }}>
          <ul onClick={() => globalStore.setClickComponentStatus(true)}>
            {renderChildren()}
          </ul>
        </div>
        )
      : null
  },
})

