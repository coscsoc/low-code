<script setup lang="ts">
import componentList from '~/base/component-list'
// draggable不能简写

const handleDragStart = (e: DragEvent, index: number) => {
  // 有时候事件触发的是icon元素, 冒泡到了list上, 用data-set会很麻烦
  e.dataTransfer?.setData('index', (index).toString())
}
</script>

<template>
  <div class="component-list">
    <div
      v-for="(item, index) in componentList"
      :key="index"
      class="list"
      draggable="true"
      @dragstart="handleDragStart($event, index)"
    >
      <span class="iconfont" :class="`icon-${item.icon}`" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.component-list {
    height: 65%;
    padding: 10px;
    display: grid;
    grid-gap: 10px 19px;
    grid-template-columns: repeat(auto-fill, 80px);
    grid-template-rows: repeat(auto-fill, 40px);

    .list {
        width: 80px;
        height: 40px;
        border: 1px solid #ddd;
        cursor: grab;
        text-align: center;
        color: #333;
        padding: 2px 5px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:active {
            cursor: grabbing;
        }

        .iconfont {
            margin-right: 4px;
            font-size: 20px;
        }

        .icon-wenben,
        .icon-biaoge {
            font-size: 18px;
        }

        .icon-tupian {
            font-size: 16px;
        }
    }
}
</style>
