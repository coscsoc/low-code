<script setup lang="ts">
import { SelectKey, StyleMap, optionMap, selectKey, styleMap } from './attrConfig'
import type { LinkageItemStyle } from '~/types'

const eventOptions = [
  { label: '点击', value: 'v-click' },
  { label: '悬浮', value: 'v-hover' },
]
const oldCompStyle = ref({
  opacity: 1,
  backgroundColor: '',
})
const globalStore = useGlobalStore()
const linkage = globalStore.curComponent!.linkage

const deleteLinkageData = (index: number) => linkage!.data.splice(index, 1)
const addLinkage = () => linkage!.data.push({
  id: '',
  label: '',
  event: '',
  style: [{ key: '', value: '' }],
})
const deleteStyle = (style: LinkageItemStyle[], index: number) => {
  style.splice(index, 1)
}
const addStyle = (style: LinkageItemStyle[]) => {
  style.push({ key: '', value: '' })
}
const handleEnter = (index: number) => {
  oldCompStyle.value = {
    opacity: globalStore.componentData[index].style.opacity,
    backgroundColor: globalStore.componentData[index].style.backgroundColor,
  }

  globalStore.componentData[index].style.opacity = '0.3'
  globalStore.componentData[index].style.backgroundColor = '#409EFF'
}
const handleOut = (index: number) => {
  globalStore.$patch((state) => {
    Object.assign(state.componentData[index].style, { ...oldCompStyle.value })
  })
}

const isShowColorPicker = (str: string) => str.toLowerCase().includes('color')
</script>

<template>
  <el-collapse-item title="组件联动（预览生效）" name="linkage" class="linkage-container">
    <el-form>
      <div v-for="(item, index) in linkage!.data" :key="index" class="linkage-component">
        <div class="div-guanbi" @click="deleteLinkageData(index)">
          <span class="iconfont icon-guanbi" />
        </div>
        <el-select v-model="item.id" placeholder="请选择联动组件">
          <el-option
            v-for="(component, i) in globalStore.componentData"
            :key="component.id"
            :value="component.id"
            :label="component.label"
          >
            <div @mouseenter="handleEnter(i)" @mouseout="handleOut(i)">
              {{ component.label }}
            </div>
          </el-option>
        </el-select>
        <el-select v-model="item.event" placeholder="请选择监听事件">
          <el-option
            v-for="e in eventOptions"
            :key="e.value"
            :value="e.value"
            :label="e.label"
          />
        </el-select>
        <p>事件触发时，当前组件要修改的属性</p>
        <div v-for="(e, i) in item.style" :key="i" class="attr-container">
          <el-select v-model="e.key" @change="e.value = ''">
            <el-option
              v-for="attr in Object.keys(globalStore.curComponent!.style)"
              :key="attr"
              :value="attr"
              :label="styleMap[attr as StyleMap]"
            />
          </el-select>
          <el-color-picker v-if="isShowColorPicker(e.key)" v-model="e.value" show-alpha />
          <el-select v-else-if="selectKey.includes(e.key as SelectKey)" v-model="e.value">
            <el-option
              v-for="option in optionMap[e.key as SelectKey]"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input
            v-else
            v-model.number="e.value"
            type="number"
            placeholder="请输入"
          />
          <span class="iconfont icon-shanchu" @click="deleteStyle(item.style, i)" />
        </div>
        <el-button @click="addStyle(item.style)">
          添加属性
        </el-button>
      </div>
      <el-button style="margin-bottom: 10px;" @click="addLinkage">
        添加组件
      </el-button>
      <p>过渡时间（秒）</p>
      <el-input v-model="linkage!.duration" class="input-duration" placeholder="请输入" />
    </el-form>
  </el-collapse-item>
</template>

<style lang="scss" scoped>
.linkage-container {
    .linkage-component {
        margin: 10px 0;
        border: 1px solid #ddd;
        padding: 10px;
        position: relative;
        padding-top: 24px;

        .div-guanbi {
            cursor: pointer;
            position: absolute;
            right: 10px;
            top: 3px;
            color: #888;
            border: 1px solid #ddd;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;

            .iconfont {
                font-size: 12px;
            }
        }
    }

    .el-select {
        margin-bottom: 10px;
    }

    .attr-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 10px 0;

        .el-select {
            margin-bottom: 0;
        }

        & > div {
            width: 97px;
        }

        .icon-shanchu {
            cursor: pointer;
        }
    }
}
</style>
