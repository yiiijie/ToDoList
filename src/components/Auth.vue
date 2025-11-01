<script setup lang="ts">
import { ref } from "vue";
import { supabase } from "@/supabase.ts";

const loading = ref<boolean>(false);
const email = ref<string>("");
const message = ref<string>("");

const handleLogin = async (): Promise<void> => {
  try {
    loading.value = true;
    message.value = "";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
    });
    if (error) throw error;
    message.value = "請檢查您的信箱，我們已發送登入連結！";
  } catch (error) {
    if (error instanceof Error) {
      message.value = error.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
  >
    <div class="max-w-md w-full">
      <!-- 登入卡片 -->
      <div class="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
        <!-- Logo 區域 -->
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">歡迎回來</h1>
          <p class="text-gray-600 text-sm">
            輸入您的信箱，我們將發送登入連結給您
          </p>
        </div>

        <!-- 表單區域 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              電子信箱
            </label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              placeholder="請輸入您的信箱"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              :disabled="loading"
            />
          </div>

          <button
            type="submit"
            :disabled="loading || !email"
            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg
              v-if="loading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ loading ? "發送中..." : "發送登入連結" }}</span>
          </button>
        </form>

        <!-- 訊息區域 -->
        <div
          v-if="message"
          class="mt-6 p-4 rounded-xl"
          :class="
            message.includes('請檢查')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          "
        >
          <div class="flex items-center">
            <svg
              v-if="message.includes('請檢查')"
              class="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <svg
              v-else
              class="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="text-sm">{{ message }}</span>
          </div>
        </div>

        <!-- 底部說明 -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            登入即表示您同意我們的
            <a href="#" class="text-blue-600 hover:text-blue-700 underline"
              >服務條款</a
            >
            和
            <a href="#" class="text-blue-600 hover:text-blue-700 underline"
              >隱私政策</a
            >
          </p>
        </div>
      </div>

      <!-- 裝飾性元素 -->
      <div
        class="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"
      ></div>
      <div
        class="absolute bottom-10 right-10 w-32 h-32 bg-indigo-200 rounded-full opacity-20 animate-pulse"
        style="animation-delay: 1s"
      ></div>
    </div>
  </div>
</template>
