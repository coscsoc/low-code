<script setup lang="ts">
import type { AnimationClassChild } from './animationConfig'

const props = defineProps<{
  curIndex: number
}>()
const emits = defineEmits(['close'])
const globalStore = useGlobalStore()
const dialogVisible = ref(true)
const isDisabled = computed(() => globalStore.curComponent!.animations.length > 1)

const original = { label: '', value: '' }
const animationConfig = ref<AnimationClassChild>(original)

animationConfig.value = globalStore.curComponent!.animations[props.curIndex] as AnimationClassChild

const resetAnimationConfig = () => animationConfig.value = original
const handleModalClose = () => {
  resetAnimationConfig()
  emits('close')
}
const handleSettingSave = () => {
  const animations = globalStore.curComponent!.animations
  const originAnimation = animations[props.curIndex]
  animations[props.curIndex] = Object.assign(originAnimation, animationConfig.value)

  const stopAnimationEventBus = useEventBus('stopAnimation')
  stopAnimationEventBus.emit()
  handleModalClose()
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${animationConfig.label} 动画配置`"
    width="30%"
    center
    @close="handleModalClose"
  >
    <div class="time">
      动画时长：<el-input-number
        v-model="animationConfig.animationTime"
        controls-position="right"
        :min="0.1"
        :precision="2"
        :step="0.01"
      />
    </div>
    <div class="loop">
      是否循环：<el-switch
        v-model="animationConfig.isLoop"
        active-text="是"
        inactive-text="否"
        :disabled="isDisabled"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleModalClose">取 消</el-button>
        <el-button type="primary" @click="handleSettingSave">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.loop {
    margin-top: 10px;
}
</style>
