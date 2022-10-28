<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { divide, multiply } from 'mathjs'
import { commonAttr, commonStyle } from '~/base/component-list'
import type { ComponentNode, GroupComponentNode } from '~/types'

const globalStore = useGlobalStore()
const { canvasStyleData, curComponent, curComponentIndex } = $(storeToRefs(globalStore))
const contextMenuStore = useContextMenuStore()
const snapshotStore = useSnapshotStore()
const composeStore = useComposeStore()
const { areaStatus } = $(storeToRefs(composeStore))

const previewStatus = ref({
  isShow: false,
  isScreenshot: false,
})

const preview = (isScreenshot: boolean) => {
  previewStatus.value.isShow = true
  previewStatus.value.isScreenshot = isScreenshot
  globalStore.$patch((state) => {
    state.editMode = 'preview'
  })
}
const handlePreviewChange = () => {
  previewStatus.value.isShow = false
  globalStore.$patch((state) => {
    state.editMode = 'edit'
  })
}
const compose = () => {
  composeStore.compose()
  snapshotStore.recordSnapshot()
}

const decompose = () => {
  composeStore.decompose()
  snapshotStore.recordSnapshot()
}

const querySelector = (el: string) => document.querySelector(el)
const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files)
    return

  const file = files[0]
  if (!file.type.includes('image'))
    return ElMessage({ type: 'warning', message: '只能插入图片' })

  const reader = new FileReader()
  reader.onload = (res: ProgressEvent) => {
    if (!res.target)
      return
    const fileResult = (res.target as FileReader).result
    const img = new Image()
    img.onload = () => {
      globalStore.addComponent({
        component: {
          ...commonAttr,
          id: generateID(),
          component: 'BasePicture',
          label: '图片',
          icon: '',
          propValue: {
            url: fileResult,
            flip: {
              horizontal: false,
              vertical: false,
            },
          },
          style: {
            ...commonStyle,
            top: 0,
            left: 0,
            width: img.width,
            height: img.height,
          },
        },
      })

      snapshotStore.recordSnapshot()
      const inputEl = querySelector('#input')
      if (inputEl) {
        inputEl.setAttribute('type', 'text')
        inputEl.setAttribute('type', 'file')
      }
    }
    img.src = fileResult as string
  }
  reader.readAsDataURL(file)
}

const editorScale = ref<number>(100)
const format = (value: number) => multiply(value, divide(editorScale.value, 100))
const originScale = (value: number) => divide(value, divide(Number(canvasStyleData.scale), 100))
const handleScaleChange = () => {
  let start = 0

  const componentData = deepClone(globalStore.componentData)
  const styleChangeList = ['top', 'left', 'width', 'height', 'fontSize']

  componentData.forEach((component: ComponentNode | GroupComponentNode) => {
    Object.keys(component.style).forEach((key) => {
      if (styleChangeList.includes(key)) {
        if (key === 'fontSize' && component.style[key] === '')
          return

        // 根据原来的比例获取样式原来的尺寸
        // 再用原来的尺寸 * 现在的比例得出新的尺寸
        component.style[key] = format(originScale(component.style[key]))
      }
    })
  })

  const { pause } = useRafFn(() => {
    if (start++ === 6)
      pause()

    globalStore.$patch((state) => {
      state.componentData = componentData
      if (curComponentIndex?.value !== undefined) {
        state.curComponent = componentData[curComponentIndex.value]
        state.curComponentIndex = curComponentIndex.value
      }
      state.canvasStyleData = { ...canvasStyleData, scale: editorScale.value }
    })
  })
}

// 这是响应式的
const save = () => {
  useStorage('canvasData', globalStore.componentData)
  useStorage('canvasStyle', globalStore.canvasStyleData)
  ElMessage({ type: 'success', message: '保存成功' })
}
const clearEditor = () => {
  globalStore.$reset()
  snapshotStore.recordSnapshot()
}
const release = () => {
  const releaseEventBus = useEventBus('release')
  releaseEventBus.emit()
}
</script>

<template>
  <div>
    <div class="toolbar">
      <el-button @click="snapshotStore.undo">
        撤消
      </el-button>
      <el-button @click="snapshotStore.revoke">
        重做
      </el-button>
      <label for="input" class="insert">
        插入图片
        <input
          id="input"
          type="file"
          hidden
          @change="handleFileChange"
        >
      </label>

      <el-button style="margin-left: 10px;" @click="preview(false)">
        预览
      </el-button>
      <el-button style="margin-left: 10px;" @click="release()">
        发布
      </el-button>
      <el-button @click="save">
        保存
      </el-button>
      <el-button @click="clearEditor">
        清空画布
      </el-button>
      <el-button :disabled="!areaStatus.components.length" @click="compose">
        组合
      </el-button>
      <el-button
        :disabled="!curComponent || curComponent.isLock || curComponent.component !== 'BaseGroup'"
        @click="decompose"
      >
        拆分
      </el-button>

      <el-button :disabled="!curComponent || curComponent.isLock" @click="contextMenuStore.lock">
        锁定
      </el-button>
      <el-button :disabled="!curComponent || !curComponent.isLock" @click="contextMenuStore.unlock">
        解锁
      </el-button>
      <el-button @click="preview(true)">
        截图
      </el-button>

      <div class="canvas-config">
        <span>画布大小: </span>
        <input v-model="canvasStyleData.width">
        <span>*</span>
        <input v-model="canvasStyleData.height">
      </div>
      <div class="canvas-config">
        <span>画布比例: </span>
        <el-input-number v-model.number="editorScale" :controls="false" :min="0" :max="100" size="small" @change="handleScaleChange" />%
      </div>
    </div>

    <Preview v-if="previewStatus.isShow" :is-screenshot="previewStatus.isScreenshot" @close="handlePreviewChange" />
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
    padding: 15px 10px;
    white-space: nowrap;
    overflow-x: auto;
    background: #fff;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;

    .canvas-config {
        display: inline-block;
        margin-left: 10px;
        font-size: 14px;
        color: #606266;

        input {
            width: 50px;
            margin-left: 4px;
            outline: none;
            padding: 0 5px;
            border: 1px solid #ddd;
            color: #606266;
        }

        span {
            margin-left: 10px;
        }
    }

    .insert {
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
        padding: 9px 15px;
        font-size: 12px;
        border-radius: 3px;
        margin-left: 10px;

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
    :deep(.el-input-number) {
      width:60px;
      .el-input__inner{
        height:20px;
        border-radius: 0;
      }
    }

    .toggle-theme{

    }
}
</style>
