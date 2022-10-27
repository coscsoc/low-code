<script setup lang="ts">
import type { EventItem } from './eventConfig'
import { BaseEvent, baseEventList } from './eventConfig'
const isModalShow = ref(false)
const eventActiveTab = ref(BaseEvent.redirect)
const baseEventLists = ref<EventItem[]>()
const globalStore = useGlobalStore()

const resetBaseEventLists = () => {
  baseEventLists.value = deepClone(baseEventList)
}
resetBaseEventLists()
const removeEvent = (event: string) => {
  resetBaseEventLists()
  delete globalStore.curComponent!.events[event]
}

const addEvent = (event: string, param: string) => {
  isModalShow.value = false
  globalStore.curComponent!.events[event] = param
  resetBaseEventLists()
}
</script>

<template>
  <div class="event-list">
    <div class="div-events">
      <el-button @click="isModalShow = true">
        添加事件
      </el-button>
      <el-tag
        v-for="event in Object.keys(globalStore.curComponent!.events)"
        :key="event"
        closable
        @close="removeEvent(event)"
      >
        {{ event }}
      </el-tag>
    </div>

    <Modal v-model:isModalShow="isModalShow">
      <el-tabs v-model="eventActiveTab">
        <el-tab-pane
          v-for="item in baseEventLists"
          :key="item.key"
          :label="item.label"
          :name="item.key"
          style="padding: 0 20px;"
        >
          <el-input
            v-model="item.param"
            type="textarea"
            :placeholder="item.placeholder"
          />
          <el-button style="margin-top: 20px;" @click="addEvent(item.key, item.param)">
            确定
          </el-button>
        </el-tab-pane>
      </el-tabs>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
.event-list {
    .div-events {
        text-align: center;
        padding: 0 20px;

        .el-button {
            display: inline-block;
            margin-bottom: 10px;
        }

        .el-tag {
            display: block;
            width: 50%;
            margin: auto;
            margin-bottom: 10px;
        }
    }
}
</style>
