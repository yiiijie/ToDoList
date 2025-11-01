<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase.ts";
import type { Session } from "@supabase/supabase-js";

const router = useRouter();
const session = ref<Session | null>(null);

onMounted(async () => {
  try {
    // 獲取當前 session
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    session.value = currentSession;
  } catch (error) {
    console.error("Error getting session:", error);
  }

  // 監聽認證狀態變化
  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session;
    // 根據認證狀態自動導航
    if (_session && router.currentRoute.value.path === "/auth") {
      router.push("/");
    } else if (!_session && router.currentRoute.value.meta.requiresAuth) {
      router.push("/auth");
    }
  });
});

// 提供 session 給子組件
provide("session", session);
</script>

<template>
  <router-view />
</template>

<style scoped></style>
