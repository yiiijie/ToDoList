<script setup lang="ts">
import { ref, toRefs, watchEffect } from "vue";
import { supabase } from "@/supabase.ts";

interface Props {
  path: string;
  size: number;
}

const prop = defineProps<Props>();
const { path, size } = toRefs(prop);

const emit = defineEmits<{
  upload: [];
  "update:path": [path: string];
}>();
const uploading = ref<boolean>(false);
const src = ref<string>("");
const files = ref<FileList | null>(null);

const downloadImage = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .download(path.value);
    if (error) throw error;
    src.value = URL.createObjectURL(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error downloading image: ", error.message);
    }
  }
};

const uploadAvatar = async (evt: Event): Promise<void> => {
  const target = evt.target as HTMLInputElement;
  files.value = target.files;
  try {
    uploading.value = true;
    if (!files.value || files.value.length === 0) {
      throw new Error("You must select an image to upload.");
    }

    const file = files.value[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    emit("update:path", filePath);
    emit("upload");
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
  } finally {
    uploading.value = false;
  }
};

watchEffect(() => {
  if (path.value) downloadImage();
});
</script>

<template>
  <div>
    <img
      v-if="src"
      :src="src"
      alt="Avatar"
      class="avatar image w-[50px] h-[50px]"
    />
    <div
      v-else
      class="avatar no-image"
      :style="{ height: size + 'em', width: size + 'em' }"
    />

    <div :style="{ width: size + 'em' }">
      <label class="button primary block" for="single">
        {{ uploading ? "Uploading ..." : "Upload" }}
      </label>
      <input
        style="visibility: hidden; position: absolute"
        type="file"
        id="single"
        accept="image/*"
        @change="uploadAvatar"
        :disabled="uploading"
      />
    </div>
  </div>
</template>
