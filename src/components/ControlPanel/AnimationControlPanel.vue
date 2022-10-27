<script setup lang="ts">
import type { ComponentInternalInstance } from 'vue'
import type { AnimationClassChild } from './animationConfig'
import animationClassList from './animationConfig'
import runAnimation from './runAnimation'
const globalStore = useGlobalStore()
const isModalShow = ref(false)
const isSettingModalShow = ref(false)
const animationActiveTab = ref('进入')
const curInstance = ref<ComponentInternalInstance | null>()
const curIndex = ref(0)

onMounted(() => {
  curInstance.value = getCurrentInstance()
})

const previewAnimation = () => {
  const animationEventBus = useEventBus('runAnimation')
  animationEventBus.emit()
}

/*
addAnimation({ curComponent }, animation) {
     curComponent.animations.push(animation)
},
removeAnimation({ curComponent }, index) {
    curComponent.animations.splice(index, 1)
},
alterAnimation({ curComponent }, { index, data = {} }) {
    if (typeof index === 'number') {
        const original = curComponent.animations[index]
        curComponent.animations[index] = { ...original, ...data }
    }
}
*/
const addAnimation = (animate: AnimationClassChild) => {
  globalStore.curComponent!.animations.push(animate)
  isModalShow.value = false
}
const removeAnimation = (index: number) => {
  const animations = globalStore.curComponent!.animations
  animations.splice(index, 1)
  if (!animations.length) {
    const stopAnimationEventBus = useEventBus('stopAnimation')
    stopAnimationEventBus.emit()
  }
}

const showAnimation = async (animate: AnimationClassChild) => {
  if (animate.pending)
    return

  animate.pending = true

  const proxy = curInstance.value?.proxy
  await runAnimation((proxy?.$refs[animate.value] as HTMLElement[])[0], [animate])
  // 防止无限触发同一元素的动画
  setTimeout(() => {
    animate.pending = false
  }, 100)
}

const handleSettingModal = (index: number) => {
  isSettingModalShow.value = true
  curIndex.value = index
}
</script>

<template>
  <div class="animation-control-panel">
    <div class="animation-operation">
      <el-button @click="isModalShow = true">
        添加动画
      </el-button>
      <el-button @click="previewAnimation">
        预览动画
      </el-button>
      <div>
        <el-tag
          v-for="(tag, index) in globalStore.curComponent!.animations"
          :key="index"
          closable
          @close="removeAnimation(index)"
        >
          {{ tag.label }}

          <i-ep-setting class="cursor el-icon-setting" @click="handleSettingModal(index)" />
        </el-tag>
      </div>
    </div>

    <Modal v-model:isModalShow="isModalShow">
      <el-tabs v-model="animationActiveTab">
        <el-tab-pane
          v-for="item in animationClassList"
          :key="item.label"
          :label="item.label"
          :name="item.label"
        >
          <el-scrollbar class="animate-container">
            <div
              v-for="child in item.children"
              :ref="child.value"
              :key="child.value"
              class="animate"
              @mouseenter="showAnimation(child)"
              @click="addAnimation(child)"
            >
              <span>{{ child.label }}</span>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </Modal>

    <AnimationSettingModal
      v-if="isSettingModalShow"
      :cur-index="curIndex"
      @close="isSettingModalShow = false"
    />
  </div>
</template>

<style lang="scss">
.animation-control-panel {
  text-align: center;

  .animation-operation {
    .el-tag {
      display: block;
      width: 50%;
      margin: 10px auto;

      &.cursor {
        cursor: pointer;
      }
    }
  }
  .el-scrollbar__view {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 10px;

    .animate {
      cursor: pointer;

      span {
        width: 100px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 8px 12px 0;
        background: #f5f8fb;
        border-radius: 3px;
        user-select: none;
        font-size: 12px;
      }
    }
}
}
</style>
