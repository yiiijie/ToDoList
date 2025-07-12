<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import TaskCard from "@/components/TaskCard.vue";

const listRef = ref<HTMLElement | null>(null);
const currentEditingTask = ref<number | null>(null);

const props = defineProps<{
  listId: number;
  title: string;
}>();

const tasks = ref<
  {
    id: number;
    content: string;
    isEditing: boolean;
  }[]
>([]);

const handleAddCard = () => {
  tasks.value.push({
    id: Date.now(),
    content: "",
    isEditing: true,
  });
  currentEditingTask.value = tasks.value[tasks.value.length - 1].id;
};

const handleStartEditing = (taskId: number) => {
  currentEditingTask.value = taskId;
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    task.isEditing = true;
  }
};

const handleStopEditing = (taskId: number) => {
  currentEditingTask.value = null;
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    task.isEditing = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (listRef.value && !listRef.value.contains(event.target as Element)) {
    if (currentEditingTask.value) {
      handleStopEditing(currentEditingTask.value);
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div ref="listRef" class="p-4 w-64">
    <p class="font-semibold mb-4">{{ title }}</p>
    <TaskCard
      v-for="item in tasks"
      :key="item.id"
      :listId="listId"
      :taskId="item.id"
      :content="item.content"
      :isEditing="item.isEditing"
      @startEditing="handleStartEditing"
      @stopEditing="handleStopEditing"
    />
    <button @click="handleAddCard" class="add-card-btn w-full text-left p-1">
      ＋ 新增卡片
    </button>
  </div>
</template>
