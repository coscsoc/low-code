<script setup lang="ts">
import requestWrapper from '../common/request'
import { useEventHandle } from '../common/eventHandle'
import type { ComponentNode, Linkage } from '~/types'
const props = defineProps<{
  propValue: Record<string, any>
  request?: Record<string, any>
  element: ComponentNode
  linkage?: Linkage
}>()
const cancelRequest = ref()
useEventHandle(props.element, props.linkage)
if (props.request) {
  // 第二个参数是要修改数据的父对象，第三个参数是修改数据的 key，第四个数据修改数据的类型
  cancelRequest.value = requestWrapper(props.request, props.element, 'propValue', 'string')
}
onBeforeUnmount(() => {
  cancelRequest.value && cancelRequest.value()
})
</script>

<template>
  <table class="v-table">
    <tbody>
      <tr
        v-for="(item, index) in propValue.data"
        :key="index"
        :class="{
          stripe: propValue.stripe && index % 2,
          bold: propValue.thBold && index === 0,
        }"
      >
        <td v-for="(e, i) in item" :key="i">
          {{ e }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
.v-table {
    border-collapse: collapse;
    table-layout: fixed;
    word-break: break-all;
    word-wrap: break-word;

    td {
        border: 1px solid #ebeef5;
        height: 40px;
        width: 60px;
        padding: 10px;
    }

    .bold {
        font-weight: bold;
    }

    .stripe {
        background-color: #fafafa;
    }
}
</style>
