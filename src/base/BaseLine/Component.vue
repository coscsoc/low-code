<script setup lang="ts">
import { useEventHandle } from '../common/eventHandle'
import type { ComponentNode, Linkage } from '~/types'

const props = defineProps<{
  element: ComponentNode
  linkage?: Linkage
}>()

// type Props = ExtractPropTypes<typeof props>
useEventHandle(props.element, props.linkage)
</script>

<template>
  <div class="base-line" />
</template>

<style lang="scss" scoped>
.line-shape {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
