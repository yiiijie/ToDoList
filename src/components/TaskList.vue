<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import TaskCard from "@/components/TaskCard.vue";
import { useTasksStore } from "@/stores/tasks";
import { useListsStore } from "@/stores/lists";
import MenuIcon from "@/components/icons/MenuIcon.vue";

const listRef = ref<HTMLElement | null>(null);
const menuDropdownRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const currentEditingTask = ref<number | null>(null);
const showDropdownList = ref<boolean>(false);

const props = defineProps<{
  list: {
    id: number;
    title: string;
    isEditing: boolean;
    isArchived: boolean;
  };
}>();

const tasksStore = useTasksStore();
const listsStore = useListsStore();

// 根據 listId 獲取對應的任務
const tasks = computed(() => tasksStore.getTasksByListId(props.list.id));

const handleAddCard = () => {
  const newTask = tasksStore.addTask(props.list.id);
  currentEditingTask.value = newTask.id;
};

const handleShowMenu = () => {
  showDropdownList.value = true;
};

const handleStartEditing = (taskId: number) => {
  currentEditingTask.value = taskId;
  tasksStore.updateTaskEditing(taskId, true);
};

const handleStopEditing = (taskId: number) => {
  tasksStore.updateTaskEditing(taskId, false);
};

const handleDeleteTask = (taskId: number) => {
  tasksStore.deleteTask(taskId);
};

const handleEditListTitle = () => {
  listsStore.updateListEditing(props.list.id, true);
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleStopEditingListTitle = () => {
  listsStore.updateListEditing(props.list.id, false);
};

const handleArchiveList = () => {
  listsStore.archiveList(props.list.id);
};

const handleClickOutside = (event: MouseEvent) => {
  // 處理關閉 Task 編輯模式
  if (listRef.value && !listRef.value.contains(event.target as Element)) {
    if (currentEditingTask.value) {
      const task = tasksStore.tasks.find(
        (t) => t.id === currentEditingTask.value
      );
      if (task) {
        tasksStore.updateTaskEditing(task.id, false);

        if (task.content.trim() === "") {
          tasksStore.deleteTask(task.id);
        }
      }
      currentEditingTask.value = null;
    }
  }

  // 處理關閉 MenuDropdown
  if (
    menuDropdownRef.value &&
    !menuDropdownRef.value.contains(event.target as Element)
  ) {
    showDropdownList.value = false;
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
    <div
      ref="menuDropdownRef"
      class="title-container mb-4 flex items-center justify-between"
    >
      <div @click="handleEditListTitle" class="flex-1 cursor-pointer">
        <h3 v-if="!list.isEditing" class="font-semibold">
          {{ list.title }}
        </h3>
        <input
          v-else
          ref="inputRef"
          v-model="list.title"
          @keyup.enter="handleStopEditingListTitle"
          @blur="handleStopEditingListTitle"
          class="w-full p-1 border border-gray-300 rounded"
        />
      </div>
      <!-- Menu Button -->
      <button
        @click="handleShowMenu"
        class="relative w-8 h-8 flex items-center justify-center rounded-lg"
        title="menu"
      >
        <MenuIcon class="w-4 h-4" />
        <!-- Dropdown Menu -->
        <div
          v-if="showDropdownList"
          class="absolute top-[calc(100%+6px)] left-0 z-10 w-40 p-2 bg-white rounded-lg shadow-md"
        >
          <p @click="handleArchiveList" class="text-left">封存這個列表</p>
        </div>
      </button>
    </div>
    <TaskCard
      v-for="item in tasks"
      :key="item.id"
      :listId="list.id"
      :taskId="item.id"
      :isEditing="item.isEditing"
      @startEditing="handleStartEditing"
      @stopEditing="handleStopEditing"
      @deleteTask="handleDeleteTask"
    />
    <button
      @click="handleAddCard"
      class="add-card-btn w-full text-left p-1 rounded-lg"
    >
      ＋ 新增卡片
    </button>
  </div>
</template>
