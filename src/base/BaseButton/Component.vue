<script setup lang="ts">
// import type { ExtractPropTypes } from 'vue'
import { useEventHandle } from '../common/eventHandle'
import type { ComponentNode, Linkage } from '~/types'

const props = defineProps<{
  propValue?: string
  element: ComponentNode
  linkage?: Linkage
}>()

// type Props = ExtractPropTypes<typeof props>
useEventHandle(props.element, props.linkage)
</script>

<template>
  <button class="base-button">
    {{ propValue }}
  </button>
</template>

<style lang="scss" scoped>
.base-button {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    width: 100%;
    height: 100%;
    font-size: 14px;

    &:active {
        color: #3a8ee6;
        border-color: #3a8ee6;
        outline: 0;
    }

    &:hover {
        background-color: #ecf5ff;
        color: #3a8ee6;
    }
}
</style>
