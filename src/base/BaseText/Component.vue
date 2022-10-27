<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts">
import requestWrapper from '../common/request'
import { useEventHandle } from '../common/eventHandle'
import type { ComponentNode, Linkage } from '~/types'
const props = defineProps<{
  propValue: string
  request?: Record<string, any>
  element: ComponentNode
  linkage?: Linkage
}>()
const textEl = ref<HTMLElement>()
const canEdit = ref(false)
const globalStore = useGlobalStore()
const cancelRequest = ref()

useEventHandle(props.element, props.linkage)
if (props.request) {
  // 第二个参数是要修改数据的父对象，第三个参数是修改数据的 key，第四个数据修改数据的类型
  cancelRequest.value = requestWrapper(props.request, props.element, 'propValue', 'string')
}
onBeforeUnmount(() => {
  cancelRequest.value && cancelRequest.value()
})

const selectText = () => {
  if (!textEl.value)
    return
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(textEl.value)
  selection!.removeAllRanges()
  selection!.addRange(range)
}
const handleTextEdit = () => {
  if (props.element.isLock)
    return

  canEdit.value = true
  // 全选
  selectText()
}

const handleMousedown = (e: MouseEvent) => canEdit.value && e.stopPropagation()

const handleBlur = (e: FocusEvent) => {
  const target = e.target as HTMLElement
  props.element.propValue = target.innerHTML || '&nbsp;'
  const html = target.innerHTML
  if (html !== '') {
    props.element.propValue = target.innerHTML
  }
  else {
    props.element.propValue = ''
    nextTick(() => {
      props.element.propValue = '&nbsp;'
    })
  }
  canEdit.value = false
}
const handleInput = (e: Event) => {
  const inputEventBus = useEventBus<ComponentNode, string>('input')
  const target = e.target as HTMLElement
  inputEventBus.emit(props.element, target.innerHTML)
}
</script>

<template>
  <div
    v-if="globalStore.editMode === 'edit'"
    class="v-text"
  >
    <!-- tabindex >= 0 使得双击时聚焦该元素 -->
    <div
      ref="textEl"
      :contenteditable="canEdit"
      :class="{ 'can-edit': canEdit }"
      tabindex="0"
      :style="{ verticalAlign: element.style.verticalAlign }"
      @dblclick="handleTextEdit"
      @mousedown="handleMousedown"
      @blur="handleBlur"
      @input="handleInput"
      v-html="element.propValue"
    />
  </div>
  <div v-else class="v-text preview">
    <div :style="{ verticalAlign: element.style.verticalAlign }" v-html="element.propValue" />
  </div>
</template>

<style lang="scss" scoped>
.v-text {
    width: 100%;
    height: 100%;
    display: table;

    div {
        display: table-cell;
        width: 100%;
        height: 100%;
        outline: none;
        word-break: break-all;
        padding: 4px;
    }

    .can-edit {
        cursor: text;
        height: 100%;
    }
}

.preview {
    user-select: none;
}
</style>
