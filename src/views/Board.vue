<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useListsStore } from "@/stores/lists";
import { useTasksStore } from "@/stores/tasks";
import TaskList from "@/components/TaskList.vue";
import ArchiveIcon from "@/components/icons/ArchiveIcon.vue";
import UserIcon from "@/components/icons/UserIcon.vue";

const router = useRouter();

const listsStore = useListsStore();
const tasksStore = useTasksStore();

// 下拉選單狀態
const isDropdownOpen = ref(false);

// 新增列表
const handleAddList = () => {
  listsStore.addList();
};

// 切換下拉選單
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 恢復列表
const handleRestoreList = (listId: number) => {
  listsStore.restoreList(listId);
};

// 永久刪除列表
const handlePermanentlyDeleteList = (listId: number) => {
  // 先刪除該列表下的所有任務
  const tasksToDelete = tasksStore.getTasksByListId(listId);
  tasksToDelete.forEach((task) => {
    tasksStore.deleteTask(task.id);
  });

  // 然後永久刪除列表
  listsStore.permanentlyDeleteList(listId);
};

// 清空所有待刪除列表
const handleClearAll = () => {
  if (confirm("確定要清空所有待刪除的列表嗎？此操作無法復原。")) {
    // 刪除所有待刪除列表下的任務
    listsStore.deletedLists.forEach((list) => {
      const tasksToDelete = tasksStore.getTasksByListId(list.id);
      tasksToDelete.forEach((task) => {
        tasksStore.deleteTask(task.id);
      });
    });

    listsStore.clearDeletedLists();
  }
};
</script>

<template>
  <header
    class="w-full h-14 bg-[#eef2f8] absolute top-0 left-0 flex justify-between items-center px-4"
  >
    <h1 class="text-h1 m-0">Todo List</h1>

    <div class="flex items-center gap-3">
      <!-- 帳戶按鈕 -->
      <button
        @click="router.push('/account')"
        class="bg-white hover:bg-gray-100 text-primary px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-300"
        title="帳戶設定"
      >
        <UserIcon class="w-4 h-4" />
        <span>帳戶</span>
      </button>

      <!-- 待刪除清單下拉選單 -->
      <div class="relative">
        <button
          @click="toggleDropdown"
          class="relative bg-[#eef2f8] hover:text-primary/80 hover:border-primary/80 text-primary border border-solid border-primary px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <ArchiveIcon class="w-4 h-4" />
          <span>已封存的項目</span>
          <span
            v-if="listsStore.deletedLists.length > 0"
            class="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
          >
            {{ listsStore.deletedLists.length }}
          </span>
        </button>

        <!-- 下拉選單內容 -->
        <div
          v-if="isDropdownOpen"
          class="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          <div class="p-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-primary">
                已封存的項目 ({{ listsStore.deletedLists.length }})
              </h3>
              <button
                v-if="listsStore.deletedLists.length > 0"
                @click="handleClearAll"
                class="bg-gray_light text-[#666] hover:bg-[#e9ebee] hover:opacity-80 px-3 py-1 rounded text-sm transition-all"
              >
                清空所有
              </button>
            </div>
          </div>

          <!-- 空狀態 -->
          <div
            v-if="listsStore.deletedLists.length === 0"
            class="p-6 text-center"
          >
            <p class="text-gray-500 text-sm">沒有已封存的列表</p>
          </div>

          <!-- 待刪除列表 -->
          <div v-else class="p-4 space-y-3">
            <div
              v-for="list in listsStore.deletedLists"
              :key="list.id"
              class="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-800 mb-1">
                    {{ list.title }}
                  </h4>
                  <p class="text-xs text-gray-500">
                    封存時間:
                    {{
                      list.archivedAt
                        ? new Date(list.archivedAt).toLocaleString("zh-TW")
                        : "未知時間"
                    }}
                  </p>
                </div>

                <div class="flex gap-1 ml-2">
                  <button
                    @click="handleRestoreList(list.id)"
                    class="bg-gray_light hover:bg-gray_light text-[#666] px-2 py-1 rounded text-xs transition-colors"
                  >
                    復原
                  </button>
                  <button
                    @click="handlePermanentlyDeleteList(list.id)"
                    class="bg-gray_light hover:bg-primary text-[#666] hover:text-white px-2 py-1 rounded text-xs transition-all"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- 點擊外部關閉下拉選單 -->
  <div
    v-if="isDropdownOpen"
    @click="isDropdownOpen = false"
    class="fixed inset-0 z-40"
  ></div>

  <div class="min-h-screen w-full overflow-x-auto">
    <div class="min-w-[600px] px-5">
      <ul class="flex items-start gap-3 pt-20">
        <TaskList
          v-for="item in listsStore.lists"
          :key="item.id"
          :list="item"
          class="bg-gray-100 rounded-lg border border-gray-300 flex-shrink-0"
        />
        <button
          @click="handleAddList"
          class="flex-shrink-0 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 px-4 py-2 transition-colors"
        >
          + 新增其他列表
        </button>
      </ul>
    </div>
  </div>
</template>
