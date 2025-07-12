import { ref, watch } from "vue";

interface TaskEvent {
  type: "updateEditing";
  listId: number;
  taskId: number;
  isEditing: boolean;
}

const events = ref<TaskEvent[]>([]);

export const eventBus = {
  // 發送事件
  emit(event: TaskEvent) {
    events.value.push(event);
  },

  // 監聽事件
  on(callback: (event: TaskEvent) => void) {
    // 簡單的實現，實際使用時可以用更複雜的事件系統
    const unwatch = watch(events, (newEvents) => {
      if (newEvents.length > 0) {
        const lastEvent = newEvents[newEvents.length - 1];
        callback(lastEvent);
        // 清除已處理的事件
        events.value = [];
      }
    });
    return unwatch;
  },
};
