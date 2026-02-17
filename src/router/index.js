import { createWebHistory, createRouter } from "vue-router";

import GeneratorIndex from "@/components/generator/GeneratorIndex.vue";

const routes = [
  { path: "/", component: GeneratorIndex },
  { path: "/gen", component: GeneratorIndex },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
