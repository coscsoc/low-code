<script setup lang="ts">
import type { ComponentInternalInstance } from 'vue'
import runAnimation from '../../ControlPanel/runAnimation'
import type { ComponentNode, GroupComponentNode } from '~/types'
import type { BaseEvent } from '~/components/ControlPanel/eventConfig'
import { baseEvents } from '~/components/ControlPanel/eventConfig'

const props = defineProps<{
  componentNode: ComponentNode | GroupComponentNode
}>()

const handleClick = () => {
  const events = props.componentNode.events
  // alert 或者 redirect事件
  Object.keys(events).forEach((event) => {
    baseEvents[event as BaseEvent](events[event])
  })

  const vClickEventBus = useEventBus<string>('v-click')
  vClickEventBus.emit(props.componentNode.id)
}

const handleMouseEnter = () => {
  const vHoverEventBus = useEventBus<string>('v-hover')
  vHoverEventBus.emit(props.componentNode.id)
}
const curInstance = ref<ComponentInternalInstance | null>()
onMounted(() => {
  curInstance.value = getCurrentInstance()
  const proxy = curInstance.value?.proxy
  runAnimation(proxy?.$el, props.componentNode.animations)
})
</script>

<template>
  <div @click="handleClick" @mouseenter="handleMouseEnter">
    <component
      :is="componentNode.component"
      v-if="componentNode.component.startsWith('SVG')"
      ref="component"
      class="component"
      :style="getSVGStyle(componentNode.style)"
      :prop-value="componentNode.propValue"
      :element="componentNode"
      :request="componentNode.request"
      :linkage="componentNode.linkage"
    />

    <component
      :is="componentNode.component"
      v-else
      ref="component"
      class="component a"
      :style="getStyle(componentNode.style)"
      :prop-value="componentNode.propValue"
      :element="componentNode"
      :request="componentNode.request"
      :linkage="componentNode.linkage"
    />
  </div>
</template>

<style lang="scss" scoped>
.component {
    position: absolute;
}
.a{
  color:red
}
</style>

