import { createRouter, createWebHistory } from "vue-router";
import Board from "@/views/Board.vue";
import Account from "@/views/Account.vue";
import Auth from "@/components/Auth.vue";
import { supabase } from "@/supabase.ts";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "board",
      component: Board,
      meta: { requiresAuth: true },
    },
    {
      path: "/account",
      name: "account",
      component: Account,
      meta: { requiresAuth: true },
    },
    {
      path: "/auth",
      name: "auth",
      component: Auth,
    },
  ],
});

// 路由守衛：檢查認證狀態
router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (to.meta.requiresAuth && !session) {
    next("/auth");
  } else if (to.path === "/auth" && session) {
    next("/");
  } else {
    next();
  }
});

export default router;
