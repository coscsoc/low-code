<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { Directive } from 'vue'

const vFocus: Directive = {
  // 指令的定义
  mounted(el: HTMLElement) {
    // 聚焦元素
    el.querySelector('input')!.focus()
  },
}

const canEdit = ref(false)
const globalStore = useGlobalStore()
const propValue = globalStore.curComponent?.propValue as Record<string, any>
const tableData: any[] = propValue.data

const curId = ref('')
const preCurTd = ref('')
const handleClick = (row: number, col: number) => {
  curId.value = `${row},${col}`
  preCurTd.value = curId.value
}
const handleBlur = () => {
  canEdit.value = false
  curId.value = ''
}

const addRow = () => {
  const length = tableData[0].length
  tableData.push(new Array(length).fill(' '))
}

const addCol = () => {
  tableData.forEach(table => table.push(''))
}
const deleteRow = () => {
  if (!preCurTd.value) {
    ElMessage.warning('请先选择要删除的行')
    return
  }
  const [row, _] = preCurTd.value.split(',')
  tableData.splice(Number(row), 1)
  preCurTd.value = ''
}
const deleteCol = () => {
  if (!preCurTd.value) {
    ElMessage.warning('请先选择要删除的列')
    return
  }
  const [_, col] = preCurTd.value.split(',');
  (tableData as any[]).forEach(table => table.splice(col, 1))
  preCurTd.value = ''
}
</script>

<template>
  <div class="edit-table">
    <table @dblclick="canEdit = true">
      <tbody>
        <tr v-for="(item, row) in tableData" :key="row">
          <td
            v-for="(e, col) in item"
            :key="col"
            :class="{ selected: curId === `${row},${col}` }"
            @click="handleClick(row, col)"
          >
            <el-input
              v-if="canEdit && curId === `${row},${col}`"
              v-model="tableData[row][col]"
              v-focus
              @blur="handleBlur"
            />
            <span v-else>{{ e }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      <button @click="addRow">
        添加新行
      </button>
      <button @click="addCol">
        添加新列
      </button>
      <button @click="deleteRow">
        删除行
      </button>
      <button @click="deleteCol">
        删除列
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.edit-table {
    overflow: auto;
    margin-bottom: 8px;

    & > div {
        margin-top: 18px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        button {
            cursor: pointer;
            background: #fff;
            border: 1px solid #dcdfe6;
            color: #606266;
            text-align: center;
            box-sizing: border-box;
            outline: 0;
            margin: 0;
            font-weight: 500;
            padding: 4px 10px;
            font-size: 14px;
            border-radius: 4px;
            margin-bottom: 10px;

            &:hover {
                background: #ecf5ff;
                color: #409eff;
            }
        }
    }

    table {
        border-collapse: collapse;
        word-break: break-all;
        word-wrap: break-word;
        text-align: center;
        font-size: 12px;

        td {
            border: 1px solid #ebeef5;
            height: 40px;
            min-width: 60px;
            max-width: 80px;
            padding: 10px;
        }
    }

    .selected {
        background: #ecf5ff;
        color: #409eff;
    }
}
</style>
