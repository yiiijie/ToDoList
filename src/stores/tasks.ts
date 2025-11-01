import { defineStore } from "pinia";
import { ref } from "vue";

export interface Task {
  id: number;
  content: string;
  isEditing: boolean;
  isCompleted: boolean;
  listId: number;
}

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);

  // 從 localStorage 載入資料
  const loadTasksFromStorage = () => {
    try {
      const stored = localStorage.getItem("tasks");
      if (stored) {
        tasks.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error("載入任務資料失敗:", error);
    }
  };

  // 儲存資料到 localStorage
  const saveTasksToStorage = () => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks.value));
    } catch (error) {
      console.error("儲存任務資料失敗:", error);
    }
  };

  // 根據 listId 獲取任務
  const getTasksByListId = (listId: number) => {
    return tasks.value.filter((task) => task.listId === listId);
  };

  // 新增任務
  const addTask = (listId: number) => {
    const newTask: Task = {
      id: Date.now(),
      content: "",
      isEditing: true,
      isCompleted: false,
      listId,
    };
    tasks.value.push(newTask);
    saveTasksToStorage();
    return newTask;
  };

  // 更新任務內容
  const updateTaskContent = (taskId: number, content: string) => {
    const task = tasks.value.find((t) => t.id === taskId);
    if (task) {
      task.content = content;
      saveTasksToStorage();
    }
  };

  // 更新任務編輯狀態
  const updateTaskEditing = (taskId: number, isEditing: boolean) => {
    const task = tasks.value.find((t) => t.id === taskId);
    if (task) {
      task.isEditing = isEditing;
      saveTasksToStorage();
    }
  };

  // 更新任務完成狀態
  const updateTaskCompletion = (taskId: number, isCompleted: boolean) => {
    const task = tasks.value.find((t) => t.id === taskId);
    if (task) {
      task.isCompleted = isCompleted;
      saveTasksToStorage();
    }
  };

  // 刪除任務
  const deleteTask = (taskId: number) => {
    tasks.value = tasks.value.filter((t) => t.id !== taskId);
    saveTasksToStorage();
  };

  // 刪除空內容的任務
  const deleteEmptyTasks = (listId: number) => {
    tasks.value = tasks.value.filter(
      (task) => !(task.listId === listId && task.content.trim() === "")
    );
    saveTasksToStorage();
  };

  // 初始化時載入資料
  loadTasksFromStorage();

  return {
    tasks,
    getTasksByListId,
    addTask,
    updateTaskContent,
    updateTaskEditing,
    updateTaskCompletion,
    deleteTask,
    deleteEmptyTasks,
    loadTasksFromStorage,
    saveTasksToStorage,
  };
});
