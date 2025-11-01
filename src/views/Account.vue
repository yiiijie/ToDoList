<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase.ts";
import type { Session } from "@supabase/supabase-js";

const router = useRouter();
const session = inject<{ value: Session | null }>("session");

const loading = ref<boolean>(true);
const username = ref<string>("");
const avatar_url = ref<string>("");
const avatarSrc = ref<string>("");
const uploading = ref<boolean>(false);
const message = ref<string>("");
const showSuccess = ref<boolean>(false);

onMounted(() => {
  if (session?.value) {
    getProfile();
  }
});

async function getProfile(): Promise<void> {
  try {
    loading.value = true;
    if (!session?.value) return;
    const { user } = session.value;

    const { data, error, status } = await supabase
      .from("profiles")
      .select(`username, avatar_url`)
      .eq("id", user.id)
      .single();

    if (error && status !== 406) throw error;

    if (data) {
      username.value = data.username;
      avatar_url.value = data.avatar_url;

      // 載入頭像圖片
      if (data.avatar_url) {
        await loadAvatarImage(data.avatar_url);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      message.value = error.message;
    }
  } finally {
    loading.value = false;
  }
}

async function loadAvatarImage(path: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .download(path);
    if (error) throw error;
    avatarSrc.value = URL.createObjectURL(data);
  } catch (error) {
    console.error("Error loading avatar:", error);
  }
}

async function handleAvatarUpload(event: Event): Promise<void> {
  console.log("handleAvatarUpload called");
  const target = event.target as HTMLInputElement;
  const files = target.files;
  console.log("Files selected:", files);

  if (!files || files.length === 0) {
    console.log("No files selected");
    return;
  }

  try {
    uploading.value = true;
    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    avatar_url.value = filePath;
    await updateProfile();
  } catch (error) {
    if (error instanceof Error) {
      message.value = error.message;
    }
  } finally {
    uploading.value = false;
  }
}

async function updateProfile(): Promise<void> {
  try {
    loading.value = true;
    message.value = "";
    if (!session?.value) return;
    const { user } = session.value;

    const updates = {
      id: user.id,
      username: username.value,
      avatar_url: avatar_url.value,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) throw error;

    message.value = "個人資料已成功更新！";
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
      message.value = "";
    }, 3000);
  } catch (error) {
    if (error instanceof Error) {
      message.value = error.message;
    }
  } finally {
    loading.value = false;
  }
}

async function signOut(): Promise<void> {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error) {
      message.value = error.message;
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4"
  >
    <div class="max-w-2xl mx-auto">
      <!-- 返回按鈕 -->
      <div class="mb-6">
        <button
          @click="router.push('/')"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          <span>返回待辦事項</span>
        </button>
      </div>

      <!-- 頁面標題 -->
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center"
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">帳戶管理</h1>
        <p class="text-gray-600">管理您的個人資料和帳戶設定</p>
      </div>

      <!-- 主要內容卡片 -->
      <div
        class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden"
      >
        <!-- 頭像區域 -->
        <div
          class="bg-gradient-to-r from-slate-100 to-gray-200 p-8 text-center border-b border-gray-100"
        >
          <!-- 圓形頭像容器 -->
          <div class="relative inline-block group">
            <!-- 使用 label 包裝整個頭像區域 -->
            <label for="avatar-upload" class="cursor-pointer block">
              <!-- 頭像圖片或預設頭像 -->
              <div
                class="w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center transition-all duration-200 group-hover:ring-4 group-hover:ring-slate-300 group-hover:ring-opacity-50"
              >
                <img
                  v-if="avatarSrc"
                  :src="avatarSrc"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
              </div>

              <!-- Hover 時的相機圖示 -->
              <div
                class="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center pointer-events-none"
              >
                <svg
                  class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </div>

              <!-- 載入狀態 -->
              <div
                v-if="uploading"
                class="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center pointer-events-none"
              >
                <svg
                  class="animate-spin w-6 h-6 text-white"
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
              </div>
            </label>
          </div>

          <!-- 使用者資訊 -->
          <h2 class="text-xl font-semibold text-gray-800 mt-6">
            {{ username || "未設定名稱" }}
          </h2>
          <!-- 隱藏的檔案輸入 -->
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            style="display: none"
          />
        </div>

        <!-- 表單區域 -->
        <div class="p-8">
          <form @submit.prevent="updateProfile" class="space-y-6">
            <!-- 電子信箱 -->
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
                :value="session?.value?.user?.email || ''"
                disabled
                class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p class="text-xs text-gray-500 mt-1">電子信箱無法修改</p>
            </div>

            <!-- 使用者名稱 -->
            <div>
              <label
                for="username"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                使用者名稱
              </label>
              <input
                id="username"
                type="text"
                v-model="username"
                placeholder="請輸入您的名稱"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                :disabled="loading"
              />
            </div>

            <!-- 按鈕區域 -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 bg-gradient-to-r from-slate-600 to-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:from-slate-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                <span>{{ loading ? "更新中..." : "更新個人資料" }}</span>
              </button>

              <button
                type="button"
                @click="signOut"
                :disabled="loading"
                class="flex-1 bg-slate-50 text-slate-700 py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-slate-200"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                <span>登出</span>
              </button>
            </div>
          </form>

          <!-- 訊息區域 -->
          <div
            v-if="message"
            class="mt-6 p-4 rounded-xl"
            :class="
              showSuccess
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            "
          >
            <div class="flex items-center">
              <svg
                v-if="showSuccess"
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
        </div>
      </div>

      <!-- 底部資訊 -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500">
          最後更新時間：{{ new Date().toLocaleString("zh-TW") }}
        </p>
      </div>
    </div>
  </div>
</template>
