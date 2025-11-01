<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTasksStore } from "@/stores/tasks";
import CloseIcon from "@/components/icons/CloseIcon.vue";

const emits = defineEmits<{
  (e: "startEditing", taskId: number): void;
  (e: "stopEditing", taskId: number): void;
  (e: "deleteTask", taskId: number): void;
}>();

const props = defineProps<{
  taskId: number;
  listId: number;
  isEditing: boolean;
}>();

const tasksStore = useTasksStore();

// 從 store 獲取當前任務
const task = computed(() =>
  tasksStore.tasks.find((t) => t.id === props.taskId)
);

const localContent = ref(task.value?.content || "");

const handleInput = (e: Event) => {
  const content = (e.target as HTMLTextAreaElement).value;
  localContent.value = content;
  tasksStore.updateTaskContent(props.taskId, content);
};

const handleDelete = () => {
  emits("deleteTask", props.taskId);
};

const handleToggleCompletion = () => {
  if (task.value) {
    tasksStore.updateTaskCompletion(props.taskId, !task.value.isCompleted);
  }
};

watch(
  () => task.value?.content,
  (val) => {
    if (val !== undefined) {
      localContent.value = val;
    }
  }
);
</script>

<template>
  <div class="relative">
    <textarea
      v-if="isEditing"
      :value="localContent"
      @input="handleInput"
      @click="emits('startEditing', taskId)"
      @blur="emits('stopEditing', taskId)"
      :id="`task-${props.taskId}`"
      :name="`task-${props.taskId}`"
      class="textarea_card w-full card_item shadow-soft bg-white rounded-lg p-2 mb-3"
      placeholder="輸入卡片內容"
    />
    <div v-else class="group">
      <div
        class="card_item shadow-soft bg-white rounded-lg mb-3 py-2 pr-5 pl-2 relative transition-all duration-200"
        :class="{
          'opacity-60 bg-gray-40': task?.isCompleted,
          'hover:shadow-md': !task?.isCompleted,
        }"
      >
        <div class="flex items-center gap-3">
          <div class="checkbox-container flex items-center justify-center">
            <input
              type="checkbox"
              :checked="task?.isCompleted || false"
              @change="handleToggleCompletion"
              class="task-checkbox"
              :id="`checkbox-${props.taskId}`"
            />
            <label
              :for="`checkbox-${props.taskId}`"
              class="checkbox-label"
            ></label>
          </div>
          <span
            class="flex-1 break-all transition-all duration-200"
            :class="{
              'text-gray-500': task?.isCompleted,
              'cursor-pointer': !task?.isCompleted,
            }"
            @click="!task?.isCompleted && emits('startEditing', taskId)"
          >
            {{ task?.content || "" }}
          </span>
        </div>
      </div>
      <button
        @click="handleDelete"
        class="absolute top-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity text-sm rounded-lg"
        title="刪除卡片"
      >
        <CloseIcon class="w-4 h-4 p-1" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.textarea_card {
  resize: none;
  height: auto;
}

.checkbox-container {
  min-width: 18px;
  min-height: 18px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  display: none;
}

.checkbox-label {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid #d1d5db;
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  border-color: #42aa79;
  background-color: #f8fafc;
}

.task-checkbox:checked + .checkbox-label {
  background-color: #42aa79;
  border-color: #42aa79;
}

.task-checkbox:checked + .checkbox-label::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
