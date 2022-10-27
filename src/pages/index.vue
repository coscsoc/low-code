<script setup lang="ts">
import { storeToRefs } from 'pinia'
import componentList from '~/base/component-list'

const tabActiveValue = ref('attr')
const globalStore = useGlobalStore()
const { isClickComponent, curComponent } = $(storeToRefs(globalStore))
const composeStore = useComposeStore()
const { editor } = storeToRefs(composeStore)
const contextMenuStore = useContextMenuStore()
const snapshotStore = useSnapshotStore()

onMounted(() => {
  listenGlobalKeyDown()
})

// 需要使用preventDefault阻止某一DOM元素对 dragover 的默认行为, 才能使 drop 事件正确执行
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const index = Number(e.dataTransfer?.getData('index'))

  if (!editor || !editor.value)
    return
  const editorRectInfo = editor.value.getBoundingClientRect()

  if (index !== undefined) {
    const component = deepClone(componentList[index])
    component.style.top = e.clientY - editorRectInfo.y
    component.style.left = e.clientX - editorRectInfo.x
    component.id = generateID()
    globalStore.addComponent({ component, index })
    snapshotStore.recordSnapshot()
  }
}

const deselectCurComponent = (e: MouseEvent) => {
  if (!isClickComponent)
    globalStore.setCurComponent({ component: undefined, index: undefined })

  if (e.button !== 2)
    contextMenuStore.hideContextMenu()
}
const handleMouseDown = (e: MouseEvent) => {
  e.stopPropagation()
  globalStore.setClickComponentStatus(false)
  globalStore.setInEditorStatus(true)
}
</script>

<template>
  <div class="home">
    <Toolbar />

    <main>
      <section class="left">
        <ComponentList />
        <RealtimeComponentList />
      </section>

      <section class="center">
        <div
          class="content"
          @drop="handleDrop"
          @dragover.prevent
          @mouseup="deselectCurComponent"
          @mousedown="handleMouseDown"
        >
          <Editor />
        </div>
      </section>

      <section class="right">
        <el-tabs v-if="curComponent" v-model="tabActiveValue">
          <el-tab-pane label="属性" name="attr">
            <component :is="`${curComponent.component}Attr`" />
          </el-tab-pane>
          <el-tab-pane label="动画" name="animation" style="padding-top: 20px;">
            <AnimationControlPanel />
          </el-tab-pane>
          <el-tab-pane label="事件" name="events" style="padding-top: 20px;">
            <EventControlPanel />
          </el-tab-pane>
        </el-tabs>
        <AttrControlPanel v-else />
      </section>
    </main>
  </div>
</template>

<style lang="scss">
.home {
    height: 100vh;
    background: #fff;

    main {
        height: calc(100% - 64px);
        position: relative;

        .left {
            position: absolute;
            height: 100%;
            width: 200px;
            left: 0;
            top: 0;

            & > div {
                overflow: auto;

                &:first-child {
                    border-bottom: 1px solid #ddd;
                }
            }
        }

        .right {
            position: absolute;
            height: 100%;
            width: 288px;
            right: 0;
            top: 0;

            .el-select {
                width: 100%;
            }
        }

        .center {
            margin-left: 200px;
            margin-right: 288px;
            background: #f5f5f5;
            height: 100%;
            overflow: auto;
            padding: 20px;

            .content {
                width: 100%;
                height: 100%;
                overflow: auto;
            }
        }
    }

    .placeholder {
        text-align: center;
        color: #333;
    }

    .global-attr {
        padding: 10px;
    }
}
</style>
