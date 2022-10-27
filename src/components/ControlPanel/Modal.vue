<script setup lang="ts">
withDefaults(defineProps<{
  isModalShow: boolean
}>(), {
  isModalShow: false,
})
const emits = defineEmits(['update:isModalShow'])

// 这样执行要给默认值
const handleModalHide = () => emits('update:isModalShow')
</script>

<template>
  <!-- 用teleport样式会有问题 -->
  <div v-if="isModalShow" class="modal-bg" @click="handleModalHide">
    <div class="fadeInLeft animated modal" @click="e => e.stopPropagation()">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .5);
    z-index: 1001;

    .modal {
        width: 400px;
        background: #fff;
        height: 100%;
    }
}
</style>
