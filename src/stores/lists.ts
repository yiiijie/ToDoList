import { defineStore } from "pinia";
import { ref } from "vue";

export interface TaskList {
  id: number;
  title: string;
  isEditing: boolean;
  isArchived: boolean;
  archivedAt?: number; // 封存時間戳
}

export const useListsStore = defineStore("lists", () => {
  const lists = ref<TaskList[]>([]);
  const deletedLists = ref<TaskList[]>([]);

  // 從 localStorage 載入資料
  const loadListsFromStorage = () => {
    try {
      const stored = localStorage.getItem("lists");
      if (stored) {
        lists.value = JSON.parse(stored);
      }

      const storedDeleted = localStorage.getItem("deletedLists");
      if (storedDeleted) {
        deletedLists.value = JSON.parse(storedDeleted);
      }
    } catch (error) {
      console.error("載入列表資料失敗:", error);
    }
  };

  // 儲存資料到 localStorage
  const saveListsToStorage = () => {
    try {
      localStorage.setItem("lists", JSON.stringify(lists.value));
      localStorage.setItem("deletedLists", JSON.stringify(deletedLists.value));
    } catch (error) {
      console.error("儲存列表資料失敗:", error);
    }
  };

  // 更新列表標題
  const updateListTitle = (listId: number, title: string) => {
    const list = lists.value.find((l) => l.id === listId);
    if (list) {
      list.title = title;
      saveListsToStorage();
    }
  };

  // 更新List編輯狀態
  const updateListEditing = (listId: number, isEditing: boolean) => {
    const list = lists.value.find((l) => l.id === listId);
    if (list) {
      list.isEditing = isEditing;
      saveListsToStorage();
    }
  };

  // 新增列表
  const addList = () => {
    const newList: TaskList = {
      id: Date.now(),
      title: "新列表",
      isEditing: false,
      isArchived: false,
    };
    lists.value.push(newList);
    saveListsToStorage();
    return newList;
  };

  // 刪除列表
  const deleteList = (listId: number) => {
    lists.value = lists.value.filter((l) => l.id !== listId);
    saveListsToStorage();
  };

  // 封存列表 - 移動到已封存清單
  const archiveList = (listId: number) => {
    const list = lists.value.find((l) => l.id === listId);
    if (list) {
      // 將列表移動到已封存清單
      deletedLists.value.push({
        ...list,
        isArchived: true,
        archivedAt: Date.now(),
      });
      // 從原列表中移除
      lists.value = lists.value.filter((l) => l.id !== listId);
      // console.log("原列表:", lists.value);
      // console.log("已封存列表:", deletedLists.value);

      saveListsToStorage();
    }
  };

  // 從已封存清單中恢復列表
  const restoreList = (listId: number) => {
    const list = deletedLists.value.find((l) => l.id === listId);
    if (list) {
      // 將列表移回原列表
      lists.value.push({ ...list, isArchived: false });
      // 從已封存清單中移除
      deletedLists.value = deletedLists.value.filter((l) => l.id !== listId);
      console.log("列表已恢復:", list);
      saveListsToStorage();
    }
  };

  // 永久刪除列表
  const permanentlyDeleteList = (listId: number) => {
    deletedLists.value = deletedLists.value.filter((l) => l.id !== listId);
    console.log("列表已永久刪除:", listId);
    saveListsToStorage();
  };

  // 清空已封存清單
  const clearDeletedLists = () => {
    deletedLists.value = [];
    saveListsToStorage();
  };

  // 初始化時載入資料
  loadListsFromStorage();

  return {
    lists,
    deletedLists,
    updateListTitle,
    updateListEditing,
    addList,
    deleteList,
    archiveList,
    restoreList,
    permanentlyDeleteList,
    clearDeletedLists,
    loadListsFromStorage,
    saveListsToStorage,
  };
});
