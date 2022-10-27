<script setup lang="ts">
import { useEventHandle } from '../common/eventHandle'
import type { ComponentNode, GroupComponentNode, Linkage } from '~/types'

const props = defineProps<{
  propValue: Array<ComponentNode | GroupComponentNode> | Record<string, any>
  element: GroupComponentNode
  linkage?: Linkage
}>()

useEventHandle(props.element, props.linkage)
</script>

<template>
  <div class="base-group">
    <div>
      <component
        :is="item.component"
        v-for="item in propValue"
        :id="`component${item.id}`"
        :key="item.id"
        class="component"
        :style="item.groupStyle"
        :prop-value="item.propValue"
        :element="item"
        :request="item.request"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-group {
    & > div {
        position: relative;
        width: 100%;
        height: 100%;

        .component {
            position: absolute;
        }
    }
}
</style>
