<!-- eslint-disable vue/no-mutating-props -->
<script>
export default {
  props: ['sendVisible', 'src'],
  emits: ['update:sendVisible'],
  computed: {
    releaseSrc() {
      return window.location.origin + this.src
    },
  },
  methods: {
    unVisible() {
      this.$emit('update:sendVisible', false)
    },
  },
}
</script>

<template>
  <div class="background">
    <el-dialog
      v-model="sendVisible"
      title="生成的链接"
      width="30%"
      top="20vh"
    >
      <router-link :to="src">
        {{ releaseSrc }}
      </router-link>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click.stop="unVisible">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.background{
    background: #fff;
    z-index: 104;
}
</style>
