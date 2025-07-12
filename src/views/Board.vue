<script setup lang="ts">
import { ref } from "vue";
import TaskList from "@/components/TaskList.vue";

interface TaskListType {
  id: number;
  title: string;
}

const taskLists = ref<TaskListType[]>([
  {
    id: 1,
    title: "待辦事項",
  },
  {
    id: 2,
    title: "進行中",
  },
  {
    id: 3,
    title: "已完成",
  },
]);
</script>

<template>
  <div class="min-h-screen w-full p-6">
    <div class="flex gap-6 overflow-x-auto">
      <TaskList
        v-for="item in taskLists"
        :key="item.id"
        :listId="item.id"
        :title="item.title"
        class="bg-gray-100 rounded-lg border border-gray-300 flex-shrink-0"
      />
      <button class="flex-shrink-0">+ 新增其他列表</button>
    </div>
  </div>
</template>
