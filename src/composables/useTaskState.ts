import { ref, provide, inject } from "vue";

interface Task {
  id: number;
  content: string;
  isEditing: boolean;
}

interface TaskList {
  id: number;
  title: string;
  tasks: Task[];
}

const TASK_STATE_KEY = Symbol("taskState");

export function provideTaskState() {
  const taskLists = ref<TaskList[]>([
    {
      id: 1,
      title: "待辦事項",
      tasks: [
        { id: 1, content: "完成專案規劃", isEditing: false },
        { id: 2, content: "設計使用者介面", isEditing: false },
      ],
    },
    {
      id: 2,
      title: "進行中",
      tasks: [{ id: 3, content: "開發核心功能", isEditing: false }],
    },
    {
      id: 3,
      title: "已完成",
      tasks: [{ id: 4, content: "設定開發環境", isEditing: false }],
    },
  ]);

  const addCard = (listId: number) => {
    const list = taskLists.value.find((l) => l.id === listId);
    if (list) {
      list.tasks.push({
        id: Date.now(),
        content: "",
        isEditing: true,
      });
    }
  };

  const updateTaskEditing = (
    listId: number,
    taskId: number,
    isEditing: boolean
  ) => {
    const list = taskLists.value.find((l) => l.id === listId);
    if (list) {
      const task = list.tasks.find((t) => t.id === taskId);
      if (task) {
        task.isEditing = isEditing;
      }
    }
  };

  provide(TASK_STATE_KEY, {
    taskLists,
    addCard,
    updateTaskEditing,
  });
}

export function useTaskState() {
  const taskState = inject(TASK_STATE_KEY);
  if (!taskState) {
    throw new Error(
      "useTaskState must be used within a component that calls provideTaskState"
    );
  }
  return taskState;
}
