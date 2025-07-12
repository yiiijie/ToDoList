<script setup lang="ts">
import { ref } from "vue";

const isEditingSelf = ref<boolean>(false);

const props = defineProps<{
  taskId: number;
  listId: number;
  content: string;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  startEditing: [taskId: number];
  stopEditing: [taskId: number];
}>();

const startEditing = () => {
  isEditingSelf.value = true;
  emit("startEditing", props.taskId);
  console.log("isEditingSelf", isEditingSelf.value);
};
</script>

<template>
  <div>
    <textarea
      @click="startEditing"
      v-if="isEditingSelf || props.isEditing"
      class="textarea_card card_item shadow-soft bg-white rounded-lg p-2 mb-3"
      placeholder="輸入卡片內容"
    >
      {{ content }}
    </textarea>
    <div
      v-else
      @click="startEditing"
      class="card_item shadow-soft bg-white rounded-lg p-2 mb-3"
    >
      {{ content }}
    </div>
  </div>
</template>

<style scoped>
.textarea_card {
  resize: none;
  height: auto;
}
</style>
